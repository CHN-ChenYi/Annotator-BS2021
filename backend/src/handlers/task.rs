use actix_identity::Identity;
use actix_web::{delete, get, post, put, web, Error, HttpResponse};
use log::error;
use serde::Deserialize;
use uuid::Uuid;

use crate::actions::*;
use crate::models::*;

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
    content.push_str("{[");
    for (idx, image) in form.images.iter().enumerate() {
        if idx > 0 {
            content.push_str(",");
        }
        content.push_str("{");
        content.push_str(format!("\"src\":\"/api/image/{}.jpg\",", image.iid).as_str());
        content.push_str(format!("\"name\":\"{}\",", image.name).as_str());
        content.push_str("\"regions\":[]}");

        iids.push(image.iid.to_owned());
    }
    content.push_str("]}");

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

#[derive(Deserialize)]
struct ExportTaskListQuery {
    export_type: u8, // 0: PASCAL VOC, 1: COCO
}

#[get("/task/{tid}/export")]
async fn export_task(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    tid: web::Path<String>,
    info: web::Query<ExportTaskListQuery>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    if info.export_type > 1 {
        return Ok(HttpResponse::BadRequest().body("Unsupported export type"));
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

    if task.owner != uid || task.worker != Some(uid) {
        return Ok(HttpResponse::Forbidden().finish());
    }

    Ok(HttpResponse::Ok().into())

    // TODO: finish it

    // let tasks = web::block(move || {
    //     let conn = pool.get()?;
    //     match info.task_type {
    //         0 => select_task_list(Some(&uid), None, None, &conn),
    //         1 => select_task_list(None, Some(&uid), None, &conn),
    //         2 => select_task_list(None, None, Some(&0), &conn),
    //         _ => unreachable!(),
    //     }
    // })
    // .await
    // .map_err(|e| {
    //     error!("{}", e);
    //     HttpResponse::InternalServerError().body(e.to_string())
    // })?;

    // let mut csv = String::new();
    // csv.push_str("id,title,description,tags,status,created_at,updated_at\n");
    // for task in tasks {
    //     csv.push_str(&format!(
    //         "{},{},{},{},{},{},{}\n",
    //         task.tid,
    //         task.title,
    //         task.description,
    //         task.tags,
    //         task.status,
    //         task.created_at,
    //         task.updated_at
    //     ));
    // }

    // let mut resp = HttpResponse::Ok();
    // resp.set_header(
    //     header::CONTENT_DISPOSITION,
    //     header::HeaderValue::from_str(&format!("attachment; filename={}", "task.csv")).unwrap(),
    // );
    // resp.set_header(header::CONTENT_TYPE, "text/json");
    // resp.set_header(header::CONTENT_LENGTH, csv.len() as u64);
    // resp.set_body(csv);

    // Ok(resp)
}
