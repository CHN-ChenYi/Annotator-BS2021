use std::io::Write;

use actix_identity::Identity;
use actix_multipart::Multipart;
use actix_web::{get, post, web, Error, HttpResponse};
use futures_util::TryStreamExt as _;
use log::error;
use uuid::Uuid;

use crate::actions::*;

#[post("/image/upload")]
async fn upload_image(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    mut payload: Multipart,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }

    let filepath = std::env::var("UPLOADED_FILE_LOCATION").expect("UPLOADED_FILE_LOCATION");

    while let Some(mut field) = payload.try_next().await? {
        let filename = Uuid::new_v4().to_string();
        let file = format!("{}/images/{}.jpg", filepath, filename);

        let mut f = web::block(|| std::fs::File::create(file)).await?;

        while let Some(chunk) = field.try_next().await? {
            f = web::block(move || f.write_all(&chunk).map(|_| f)).await?;
        }

        let uid = id.identity().unwrap();
        let conn = match pool.get() {
            Ok(conn) => conn,
            Err(e) => return Ok(HttpResponse::InternalServerError().body(e.to_string())),
        };

        web::block(move || insert_new_image(&filename, &uid, &conn))
            .await
            .map_err(|e| {
                error!("{}", e);
                HttpResponse::InternalServerError().body(e.to_string())
            })?;
    }

    Ok(HttpResponse::Ok().into())
}

#[get("image/all")]
async fn get_images_id(
    pool: web::Data<crate::DbPool>,
    id: Identity,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    let images_id = web::block(move || {
        let conn = pool.get()?;
        get_images_id_by_uid(&uid, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    Ok(HttpResponse::Ok().json(images_id))
}
