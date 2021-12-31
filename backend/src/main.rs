#[macro_use]
extern crate diesel;
extern crate chrono;
extern crate env_logger;
extern crate log;
extern crate threadpool;
extern crate imagesize;

use actix_cors::Cors;
use actix_files::Files;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{middleware, web, App, HttpServer};
use diesel::mysql::MysqlConnection;
use diesel::r2d2::{self, ConnectionManager};
use rand::Rng;
use std::fs;

type DbPool = r2d2::Pool<ConnectionManager<MysqlConnection>>;
type DbError = Box<dyn std::error::Error + Send + Sync>;

mod actions;
mod handlers;
mod models;
mod schema;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info,info");
    env_logger::init();
    dotenv::dotenv().ok();

    let fileroot = std::env::var("UPLOADED_FILE_LOCATION").expect("UPLOADED_FILE_LOCATION");
    fs::create_dir_all(fileroot.clone() + &"/images").expect("Couldn't create image directory");
    fs::create_dir_all(fileroot.clone() + &"/tmp").expect("Couldn't create tmp directory");

    let filepath = fileroot + &"/images";

    let connspec = std::env::var("DATABASE_URL").expect("DATABASE_URL");
    let manager = ConnectionManager::<MysqlConnection>::new(connspec);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");

    let port = std::env::var("PORT").expect("PORT");
    let bind = "localhost:".to_owned() + &port;

    log::info!("Starting server at: {}", &bind);

    let private_key = rand::thread_rng().gen::<[u8; 32]>();

    let cors = match std::str::FromStr::from_str(&std::env::var("CORS").expect("CORS")) {
        Ok(true) => true,
        _ => false,
    };

    HttpServer::new(move || {
        App::new()
            .wrap(match cors {
                true => Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
                    .supports_credentials()
                    .expose_any_header(),
                false => Cors::default(),
            })
            .data(pool.clone())
            .data(threadpool::ThreadPool::new(1))
            .wrap(middleware::Logger::default())
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&private_key)
                    .name("auth-cookie")
                    .secure(false),
            ))
            .service(
                web::scope("/api")
                    .service(handlers::signup_user)
                    .service(handlers::login_user)
                    .service(handlers::logout_user)
                    .service(handlers::upload_image)
                    .service(handlers::get_images_id)
                    .service(Files::new("/image", &filepath).prefer_utf8(true))
                    // .service(handlers::get_image_from_oss)
                    .service(handlers::upload_video)
                    .service(handlers::new_task)
                    .service(handlers::get_task)
                    .service(handlers::claim_task)
                    .service(handlers::revoke_task)
                    .service(handlers::update_task)
                    .service(handlers::get_task_list)
            )
    })
    .bind(&bind)?
    .run()
    .await
}
