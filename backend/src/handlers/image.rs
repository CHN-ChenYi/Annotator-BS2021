use std::io::Write;

use actix_identity::Identity;
use actix_web::{post, web, Error, HttpResponse};
use actix_multipart::Multipart;
use futures_util::TryStreamExt as _;
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
            Err(_) => return Ok(HttpResponse::InternalServerError().finish()),
        };

        web::block(move || {
            insert_new_image(&filename, &uid, &conn)
        })
        .await
        .map_err(|e| {
            log::error!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    }

    Ok(HttpResponse::Ok().into())
}