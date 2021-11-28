use actix_identity::Identity;
use actix_web::{post, web, Error, HttpResponse};
use log::error;
use uuid::Uuid;

use crate::actions::*;
use crate::models::*;

#[post("/task")]
async fn new_task(
    pool: web::Data<crate::DbPool>,
    id: Identity,
    form: web::Json<NewTask>,
) -> Result<HttpResponse, Error> {
    if id.identity().is_none() {
        return Ok(HttpResponse::Unauthorized().finish());
    }
    let uid = id.identity().unwrap();

    let tid = Uuid::new_v4().to_string();

    let mut content = String::new();
    let mut iids: Vec<String> = Vec::new();
    content.push_str("{[");
    for (idx, image) in form.images.iter().enumerate() {
        if idx > 0 {
            content.push_str(",");
        }
        content.push_str("{");
        content.push_str(format!("\"src\":\"/api/image/{}.jpg\",", image.iid).as_str());
        content.push_str(format!("\"name\":\"{}\",", image.name).as_str());
        content.push_str("\"regions\":[]}");

        iids.push(image.iid.to_owned());
    }
    content.push_str("]}");

    let _task = web::block(move || {
        let conn = pool.get()?;
        insert_new_task(&tid, &uid, &form.title, &form.description, &content, &form.tags, &iids, &conn)
    })
    .await
    .map_err(|e| {
        error!("{}", e);
        HttpResponse::InternalServerError().finish()
    })?;

    Ok(HttpResponse::Ok().into())
}
