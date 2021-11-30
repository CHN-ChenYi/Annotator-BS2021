use actix_identity::Identity;
use actix_web::{post, web, Error, HttpResponse};
use log::error;

use crate::actions::*;
use crate::models::*;

#[post("/user")]
async fn signup_user(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    form: web::Json<NewUser>,
) -> Result<HttpResponse, Error> {
    if !email_address::EmailAddress::is_valid(&form.email) {
        return Ok(HttpResponse::BadRequest().json("Invalid email address".to_owned()));
    }

    let user = web::block(move || {
        let conn = pool.get()?;
        insert_new_user(&form.email, &form.username, &form.password, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    let res = PublicUser {
        id: user.id,
        email: user.email,
        username: user.username,
    };

    id.remember(res.id.clone());
    Ok(HttpResponse::Ok().json(res))
}

#[post("/user/login")]
async fn login_user(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    form: web::Json<ExistUser>,
) -> Result<HttpResponse, Error> {
    let user = web::block(move || {
        let conn = pool.get()?;
        user_login(&form.email, &form.password, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    })?;

    if let Some(res) = user {
        id.remember(res.id.clone());
        Ok(HttpResponse::Ok().json(res))
    } else {
        let res = HttpResponse::BadRequest().body("username and password doesn't match");
        Ok(res)
    }
}

#[post("/user/logout")]
async fn logout_user(_: web::Data<crate::DbPool>, id: Identity) -> Result<HttpResponse, Error> {
    id.forget();
    let res = HttpResponse::Found().header("location", "/").finish();
    Ok(res)
}
