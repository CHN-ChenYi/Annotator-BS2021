#[macro_use]
extern crate diesel;
extern crate chrono;
extern crate env_logger;
extern crate log;
extern crate threadpool;

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

    let bind = "127.0.0.1:8080";

    log::info!("Starting server at: {}", &bind);

    let private_key = rand::thread_rng().gen::<[u8; 32]>();

    HttpServer::new(move || {
        App::new()
            .data(pool.clone())
            .data(threadpool::ThreadPool::new(1))
            .wrap(middleware::Logger::default())
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&private_key)
                    .name("auth-example")
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
                    .service(handlers::upload_video)
                    .service(handlers::new_task)
                    .service(handlers::get_task)
            )
    })
    .bind(&bind)?
    .run()
    .await
}
