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
