use diesel::prelude::*;
use imagesize::size;
use oss_rust_sdk::prelude::*;
use std::collections::HashMap;

use crate::models;
use crate::DbError;

pub fn insert_new_image(
    id_: &str,
    uid_: &str,
    conn: &MysqlConnection,
) -> Result<models::Image, DbError> {
    use crate::schema::images::dsl::*;
    let id__ = id_.to_owned();

    let filepath = std::env::var("UPLOADED_FILE_LOCATION").expect("UPLOADED_FILE_LOCATION");
    let (image_width, image_height) = match size(format!("{}/images/{}.jpg", filepath, id__)) {
        Ok(dim) => (dim.width, dim.height),
        Err(why) => {
            return Err(DbError::from(format!(
                "Failed to get image size: {:?}",
                why
            )));
        }
    };

    let new_image = models::Image {
        id: id__.clone(),
        uid: uid_.to_owned(),
        tid: None,
        height: Some(image_height as i32),
        width: Some(image_width as i32),
        created_at: chrono::Utc::now().naive_utc(),
    };

    if std::str::FromStr::from_str(&std::env::var("OSS").expect("OSS")) == Ok(true) {
        let filename = format!("{}/images/{}.jpg", filepath, id__.clone());
        let oss_instance = OSS::new(
            std::env::var("OSS_ACCESS_KEY_ID").expect("OSS_ACCESS_KEY_ID"),
            std::env::var("OSS_ACCESS_KEY_SECRET").expect("OSS_ACCESS_KEY_SECRET"),
            std::env::var("OSS_ENDPOINT").expect("OSS_ENDPOINT"),
            std::env::var("OSS_BUCKET").expect("OSS_BUCKET"),
        );
        if !oss_instance
            .put_object_from_file(
                filename.clone(),
                format!("{}.jpg", id__),
                None::<HashMap<&str, &str>>,
                None,
            )
            .is_ok()
        {
            return Err(DbError::from(format!(
                "Failed to upload image to OSS: {}",
                id__.to_owned()
            )));
        }
        match std::fs::remove_file(filename) {
            Ok(_) => (),
            Err(e) => {
                return Err(DbError::from(e));
            }
        }
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

pub fn get_image_by_iid(iid_: &str, conn: &MysqlConnection) -> Result<models::Image, DbError> {
    use crate::schema::images::dsl::*;

    images
        .filter(id.eq(dbg!(iid_)))
        .first::<models::Image>(conn)
        .map_err(|e| DbError::from(e))
}
