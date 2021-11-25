use actix_identity::Identity;
use actix_web::{post, web, Error, HttpResponse};

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
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
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
        user_login(&form.username, &form.password, &conn)
    })
    .await
    .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
    })?;

    if let Some(res) = user {
        id.remember(res.id.clone());
        Ok(HttpResponse::Ok().json(res))
    } else {
        let res = HttpResponse::NotFound().body("username and password doesn't match");
        Ok(res)
    }
}

#[post("/user/logout")]
async fn logout_user(_: web::Data<crate::DbPool>, id: Identity) -> Result<HttpResponse, Error> {
    dbg!(id.identity());
    id.forget();
    let res = HttpResponse::Found().header("location", "/").finish();
    Ok(res)
}
