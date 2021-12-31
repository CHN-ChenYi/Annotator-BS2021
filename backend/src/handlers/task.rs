use actix_identity::Identity;
use actix_web::{delete, get, post, put, web, Error, HttpResponse};
use log::error;
use serde::Deserialize;
use uuid::Uuid;

use crate::actions::*;
use crate::models::*;

fn get_iid_from_url(url: &str) -> std::string::String {
    str::replace(url.get(url.rfind('/').unwrap() + 1..).unwrap(), ".jpg", "")
    // let re = regex::Regex::new(r"/(.*)").unwrap();
    // for cap in re.captures_iter(url) {
    //     return dbg!(str::replace(&cap[1], ".jpg", ""));
    // }
    // return "".to_string();
}

#[post("/task")]
async fn new_task(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    form: web::Json<NewTask>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    let tid = Uuid::new_v4().to_string();

    let mut content = String::new();
    let mut iids: Vec<String> = Vec::new();
    content.push_str("[");
    for (idx, image) in form.images.iter().enumerate() {
        if idx > 0 {
            content.push_str(",");
        }
        content.push_str("{");
        content.push_str(format!("\"src\":\"{}\",", image.iid).as_str());
        content.push_str(format!("\"name\":\"{}\",", image.name).as_str());

        let pool_ = pool.clone();
        let iid_ = get_iid_from_url(&image.iid);
        let iid__ = iid_.clone();
        let image_info = web::block(move || {
            let conn = pool_.get()?;
            get_image_by_iid(&iid__, &conn)
        })
        .await
        .map_err(|e| {
            error!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        })?;
        if let Some(width) = image_info.width {
            content.push_str(format!("\"width\":{},", width).as_str());
        }
        if let Some(height) = image_info.height {
            content.push_str(format!("\"height\":{},", height).as_str());
        }
        content.push_str(format!("\"id\":\"{}\",", iid_).as_str());
        content.push_str(format!("\"date_captured\":\"{}\",", image_info.created_at).as_str());

        content.push_str("\"regions\":[]}");

        iids.push(iid_.to_owned());
    }
    content.push_str("]");

    let _task = web::block(move || {
        let conn = pool.get()?;
        insert_new_task(
            &tid,
            &uid,
            &form.title,
            &form.description,
            &content,
            &form.tags,
            &iids,
            &conn,
        )
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    Ok(HttpResponse::Ok().into())
}

#[get("/task/{tid}")]
async fn get_task(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    tid: web::Path<String>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }

    let task = web::block(move || {
        let conn = pool.get()?;
        get_task_by_tid(&tid, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    Ok(HttpResponse::Ok().json(task))
}

#[post("/task/{tid}/worker")]
async fn claim_task(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    tid: web::Path<String>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    let affected_rows = web::block(move || {
        let conn = pool.get()?;
        claim_task_by_tid_and_uid(&tid, &uid, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    match affected_rows {
        0 => Ok(HttpResponse::BadRequest().body("The task has been claimed")),
        _ => Ok(HttpResponse::Ok().finish()),
    }
}

#[delete("/task/{tid}/worker")]
async fn revoke_task(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    tid: web::Path<String>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    let affected_rows = web::block(move || {
        let conn = pool.get()?;
        revoke_task_by_tid_and_uid(&tid, &uid, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    match affected_rows {
        0 => Ok(HttpResponse::Forbidden().finish()),
        _ => Ok(HttpResponse::Ok().finish()),
    }
}

#[put("/task/{tid}")]
async fn update_task(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    tid: web::Path<String>,
    form: web::Json<UpdateTask>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    let affected_rows = web::block(move || {
        let conn = pool.get()?;
        update_task_by_tid(&form.content, &form.status, &tid, &uid, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    match affected_rows {
        0 => Ok(HttpResponse::Forbidden().finish()),
        _ => Ok(HttpResponse::Ok().finish()),
    }
}

#[derive(Deserialize)]
struct GetTaskListQuery {
    task_type: u8, // 0: owned, 1: claimed, 2: unassigned
}

#[get("/task-list/all")]
async fn get_task_list(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    info: web::Query<GetTaskListQuery>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    if info.task_type > 2 {
        return Ok(HttpResponse::BadRequest().body("Unsupported task type"));
    }

    let tasks = web::block(move || {
        let conn = pool.get()?;
        match info.task_type {
            0 => select_task_list(Some(&uid), None, None, &conn),
            1 => select_task_list(None, Some(&uid), None, &conn),
            2 => select_task_list(None, None, Some(&0), &conn),
            _ => unreachable!(),
        }
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    Ok(HttpResponse::Ok().json(tasks))
}
