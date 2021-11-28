use std::io::Write;

use actix_identity::Identity;
use actix_multipart::Multipart;
use actix_web::{post, web, Error, HttpResponse};
use futures_util::TryStreamExt as _;
use log::error;
use serde::Deserialize;
use std::path::Path;
use uuid::Uuid;

use crate::actions::*;

fn get_file_ext(filename: &str) -> String {
    filename[filename.rfind('.').unwrap()..].to_string()
}

#[derive(Deserialize)]
struct UploadVideoQuery {
    step: f32,
    cnt: u32,
}

#[post("/video/upload")]
async fn upload_video(
    db_pool: web::Data<crate::DbPool>,
    thread_pool: web::Data<threadpool::ThreadPool>,
    id: Identity,
    mut payload: Multipart,
    info: web::Query<UploadVideoQuery>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }

    let filepath = std::env::var("UPLOADED_FILE_LOCATION").expect("UPLOADED_FILE_LOCATION");
    let filepath_ = filepath.clone();

    while let Some(mut field) = payload.try_next().await? {
        let content_disposition = field
            .content_disposition()
            .ok_or_else(|| HttpResponse::BadRequest().finish())?;
        let filename = content_disposition.get_filename().map_or_else(
            || Uuid::new_v4().to_string(),
            |f| Uuid::new_v4().to_string() + &get_file_ext(&sanitize_filename::sanitize(f)),
        );

        let video_file = format!("{}/tmp/{}", filepath_, filename);
        let video_file_ = video_file.clone();

        let mut f = web::block(|| std::fs::File::create(video_file_)).await?;

        while let Some(chunk) = field.try_next().await? {
            f = web::block(move || f.write_all(&chunk).map(|_| f)).await?;
        }

        let cnt = info.cnt;
        let step = info.step;
        let uid = id.identity().unwrap();
        let filepath = filepath.clone();
        let pool = db_pool.clone();
        thread_pool.execute(move || {
            for i in 0..cnt {
                let filename = Uuid::new_v4().to_string();
                let image_file = format!("{}/images/{}.jpg", filepath, filename);

                let j = (i + 1) as f32 * step;

                let ffmpeg_output = std::process::Command::new("ffmpeg")
                    .arg("-ss")
                    .arg(j.to_string())
                    .arg("-i")
                    .arg(video_file.clone())
                    .arg("-frames:v")
                    .arg("1")
                    .arg("-y")
                    .arg(image_file.clone())
                    .output()
                    .unwrap();

                if !(Path::new(&image_file).exists()) {
                    error!("ffmpeg status: {}", ffmpeg_output.status);
                    error!(
                        "ffmpeg stdout: {}",
                        String::from_utf8_lossy(&ffmpeg_output.stdout)
                    );
                    error!(
                        "ffmpeg stderr: {}",
                        String::from_utf8_lossy(&ffmpeg_output.stderr)
                    );
                    return;
                }

                let conn = match pool.get() {
                    Ok(conn) => conn,
                    Err(_) => return,
                };

                match insert_new_image(&filename, &uid, &conn) {
                    Ok(_) => (),
                    Err(e) => {
                        error!("{}", e);
                        return;
                    }
                }
            }
            match std::fs::remove_file(video_file) {
                Ok(_) => (),
                Err(e) => {
                    error!("{}", e);
                    return;
                }
            }
        });
    }

    Ok(HttpResponse::Ok().into())
}
