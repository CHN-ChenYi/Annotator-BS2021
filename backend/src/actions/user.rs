extern crate bcrypt;

use bcrypt::{hash, verify, DEFAULT_COST};
use diesel::prelude::*;
use uuid::Uuid;

use crate::models;
use crate::DbError;

pub fn find_user_by_uid(
    uid: Uuid,
    conn: &MysqlConnection,
) -> Result<Option<models::User>, DbError> {
    use crate::schema::users::dsl::*;

    let user = users
        .filter(id.eq(uid.to_string()))
        .first::<models::User>(conn)
        .optional()?;

    Ok(user)
}

pub fn insert_new_user(
    email_: &str,
    username_: &str,
    password_: &str,
    conn: &MysqlConnection,
) -> Result<models::User, DbError> {
    use crate::schema::users::dsl::*;

    let hashed = hash(password_.to_owned(), DEFAULT_COST)?;

    let new_user = models::User {
        id: Uuid::new_v4().to_string(),
        email: email_.to_owned(),
        username: username_.to_owned(),
        password: hashed.to_owned(),
    };

    diesel::insert_into(users).values(&new_user).execute(conn)?;

    Ok(new_user)
}

pub fn user_login(
    username_: &str,
    password_: &str,
    conn: &MysqlConnection,
) -> Result<Option<models::PublicUser>, DbError> {
    use crate::schema::users::dsl::*;

    let user = users
        .filter(username.eq(username_))
        .first::<models::User>(conn)
        .optional()?
        .unwrap();

    let valid = verify(password_.to_owned(), &user.password)?;

    if valid {
        Ok(Some(models::PublicUser {
            id: user.id,
            email: user.email,
            username: user.username,
        }))
    } else {
        Ok(None)
    }
}
