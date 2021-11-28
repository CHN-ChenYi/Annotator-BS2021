use diesel::prelude::*;

use crate::models;
use crate::DbError;

pub fn insert_new_task(
    id_: &str,
    owner_: &str,
    title_: &str,
    description_: &str,
    content_: &str,
    tags_: &str,
    iids_: &Vec<String>,
    conn: &MysqlConnection,
) -> Result<models::Task, DbError> {
    use crate::schema::tasks::dsl::*;
    use crate::schema::images::dsl::*;

    let new_task = models::Task {
        id: id_.to_owned(),
        owner: owner_.to_owned(),
        title: title_.to_owned(),
        description: description_.to_owned(),
        content: content_.to_owned(),
        tags: tags_.to_owned(),
        worker: None,
        status: 0,
        created_at: chrono::Utc::now().naive_utc(),
        updated_at: chrono::Utc::now().naive_utc(),
    };

    match conn.transaction::<_, diesel::result::Error, _>(|| {
        for iid in iids_.iter() {
            let image = images.find(iid).first::<models::Image>(conn)?;
            assert_eq!(image.tid, None);
            diesel::update(images.find(image.id))
                .set(tid.eq(id_))
                .execute(conn)?;
        }
        diesel::insert_into(tasks).values(&new_task).execute(conn)?;
        Ok(())
    }) {
        Ok(_) => Ok(new_task),
        Err(e) => Err(DbError::from(e)),
    }
}

pub fn get_task_by_tid(
    tid: &str,
    conn: &MysqlConnection,
) -> Result<models::Task, DbError> {
    use crate::schema::tasks::dsl::*;

    tasks
        .filter(id.eq(tid))
        .first::<models::Task>(conn)
        .map_err(|e| DbError::from(e))
}