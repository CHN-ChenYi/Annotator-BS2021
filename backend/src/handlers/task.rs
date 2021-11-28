use actix_identity::Identity;
use actix_web::{get, post, put, delete, web, Error, HttpResponse};
use log::error;
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
        HttpResponse::InternalServerError().finish()
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
        HttpResponse::InternalServerError().finish()
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
        HttpResponse::InternalServerError().finish()
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
        HttpResponse::InternalServerError().finish()
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
        HttpResponse::InternalServerError().finish()
    })?;

    match affected_rows {
        0 => Ok(HttpResponse::Forbidden().finish()),
        _ => Ok(HttpResponse::Ok().finish()),
    }
}