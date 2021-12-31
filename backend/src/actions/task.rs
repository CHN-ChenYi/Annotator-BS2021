use diesel::prelude::*;

use crate::actions;
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
    use crate::schema::images::dsl::*;
    use crate::schema::tasks::dsl::*;

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

pub fn get_task_by_tid(tid_: &str, conn: &MysqlConnection) -> Result<models::Task, DbError> {
    use crate::schema::tasks::dsl::*;

    tasks
        .filter(id.eq(tid_))
        .first::<models::Task>(conn)
        .map_err(|e| DbError::from(e))
}

pub fn claim_task_by_tid_and_uid(
    tid_: &str,
    uid_: &str,
    conn: &MysqlConnection,
) -> Result<usize, DbError> {
    use crate::schema::tasks::dsl::*;

    let task = tasks.filter(id.eq(tid_)).first::<models::Task>(conn)?;

    if task.worker.is_some() {
        return Ok(0);
    }

    let affected_rows = diesel::update(tasks.find(tid_))
        .set((worker.eq(uid_), status.eq(1)))
        .execute(conn)?;

    Ok(affected_rows)
}

pub fn revoke_task_by_tid_and_uid(
    tid_: &str,
    uid_: &str,
    conn: &MysqlConnection,
) -> Result<usize, DbError> {
    use crate::schema::tasks::dsl::*;

    let task = tasks.filter(id.eq(tid_)).first::<models::Task>(conn)?;

    if task.owner != uid_.to_owned() {
        return Ok(0);
    }

    let affected_rows = diesel::update(tasks.find(tid_))
        .set((worker.eq(None::<String>), status.eq(0)))
        .execute(conn)?;

    Ok(affected_rows)
}

pub fn update_task_by_tid(
    content_: &str,
    status_: &i8,
    tid_: &str,
    uid_: &str,
    conn: &MysqlConnection,
) -> Result<usize, DbError> {
    use crate::schema::tasks::dsl::*;

    let task = tasks.filter(id.eq(tid_)).first::<models::Task>(conn)?;

    if task.worker != Some(uid_.to_owned()) && task.owner != uid_.to_owned() {
        return Ok(0);
    }

    let affected_rows = diesel::update(tasks.find(tid_))
        .set((
            content.eq(content_),
            status.eq(status_),
            updated_at.eq(chrono::Utc::now().naive_utc()),
        ))
        .execute(conn)?;

    Ok(affected_rows)
}

pub fn select_task_list(
    owner_: Option<&str>,
    worker_: Option<&str>,
    status_: Option<&i8>,
    conn: &MysqlConnection,
) -> Result<Vec<models::TaskListEntry>, DbError> {
    use crate::schema::images::dsl::*;
    use crate::schema::tasks::dsl::*;
    assert_eq!(
        owner_.is_some() || worker_.is_some() || status_.is_some(),
        true
    );
    assert_ne!(owner_.is_some() && status_.is_some(), true);
    assert_ne!(worker_.is_some() && status_.is_some(), true);
    assert_ne!(owner_.is_some() && worker_.is_some(), true);

    let mut query = tasks.into_boxed();
    if let Some(owner__) = owner_ {
        query = query.filter(owner.eq(owner__));
    } else if let Some(worker__) = worker_ {
        query = query.filter(worker.eq(worker__));
    } else if let Some(status__) = status_ {
        query = query.filter(status.eq(status__)).filter(worker.is_null());
    }

    let result = query.order(updated_at.desc()).load::<models::Task>(conn)?;

    let host = std::env::var("HOST").expect("HOST");
    let oss_path = std::env::var("OSS_PATH").expect("OSS_PATH");

    let oss = match std::str::FromStr::from_str(&std::env::var("OSS").expect("OSS")) {
        Ok(true) => true,
        _ => false,
    };

    let mut list: Vec<models::TaskListEntry> = Vec::new();
    for row in result.iter() {
        let cover_image_ = images
            .filter(tid.eq(row.id.to_owned()))
            .first::<models::Image>(conn)?
            .id;
        let cover_image_path = match oss {
            false => format!("{}/api/image/{}.jpg", host, cover_image_),
            true => format!("{}/{}.jpg", oss_path, cover_image_),
        };
        let owner_pub = actions::get_user_by_id(&row.owner, conn)?.unwrap();
        let worker_pub = match &row.worker {
            Some(worker__) => match actions::get_user_by_id(&worker__, conn)? {
                Some(user) => Some(user),
                None => None,
            },
            None => None,
        };
        list.push(models::TaskListEntry {
            id: row.id.to_owned(),
            owner: owner_pub.to_owned(),
            title: row.title.to_owned(),
            description: row.description.to_owned(),
            worker: worker_pub.to_owned(),
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            cover_image: cover_image_path.to_owned(),
        });
    }

    Ok(list)
}
