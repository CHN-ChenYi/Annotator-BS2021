use serde::{Deserialize, Serialize};

use crate::schema::tags;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
pub struct Tag {
    pub id: String,
    pub tid: String,
    pub content: String,
}
