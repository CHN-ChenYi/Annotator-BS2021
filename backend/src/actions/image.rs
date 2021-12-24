use diesel::prelude::*;

use crate::models;
use crate::DbError;

pub fn insert_new_image(
    id_: &str,
    uid_: &str,
    conn: &MysqlConnection,
) -> Result<models::Image, DbError> {
    use crate::schema::images::dsl::*;

    let new_image = models::Image {
        id: id_.to_owned(),
        uid: uid_.to_owned(),
        tid: None,
        created_at: chrono::Utc::now().naive_utc(),
    };

    diesel::insert_into(images)
        .values(&new_image)
        .execute(conn)?;

    Ok(new_image)
}

pub fn get_images_id_by_uid(uid_: &str, conn: &MysqlConnection) -> Result<Vec<String>, DbError> {
    use crate::schema::images::dsl::*;

    let images_id = images
        .filter(uid.eq(uid_))
        .filter(tid.is_null())
        .select(id)
        .order_by(created_at.desc())
        .load::<String>(conn)?;

    Ok(images_id)
}

pub fn get_image_create_time_by_iid(
    iid_: &str,
    conn: &MysqlConnection,
) -> Result<chrono::NaiveDateTime, DbError> {
    use crate::schema::images::dsl::*;

    let create_time = images
        .filter(id.eq(iid_))
        .select(created_at)
        .first::<chrono::NaiveDateTime>(conn)?;

    Ok(create_time)
}
