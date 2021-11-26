use serde::{Deserialize, Serialize};

use crate::schema::images;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
pub struct Image {
    pub id: String,
    pub uid: String,
}