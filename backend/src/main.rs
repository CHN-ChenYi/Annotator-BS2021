#[macro_use]
extern crate diesel;

use actix_web::{middleware, App, HttpServer};
use actix_identity::{CookieIdentityPolicy, IdentityService};
use diesel::mysql::MysqlConnection;
use diesel::r2d2::{self, ConnectionManager};
use rand::Rng;

type DbPool = r2d2::Pool<ConnectionManager<MysqlConnection>>;
type DbError = Box<dyn std::error::Error + Send + Sync>;

mod schema;
mod models;
mod handlers;
mod actions;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();
    dotenv::dotenv().ok();

    let _ = std::env::var("UPLOADED_FILE_LOCATION").expect("UPLOADED_FILE_LOCATION");

    let connspec = std::env::var("DATABASE_URL").expect("DATABASE_URL");
    let manager = ConnectionManager::<MysqlConnection>::new(connspec);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");

    let bind = "127.0.0.1:8080";

    println!("Starting server at: {}", &bind);

    let private_key = rand::thread_rng().gen::<[u8; 32]>();

    HttpServer::new(move || {
        App::new()
            .data(pool.clone())
            .wrap(middleware::Logger::default())
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&private_key)
                    .name("auth-example")
                    .secure(false),
            ))
            .service(handlers::signup_user)
            .service(handlers::login_user)
            .service(handlers::logout_user)
            .service(handlers::upload_image)
    })
    .bind(&bind)?
    .run()
    .await
}
