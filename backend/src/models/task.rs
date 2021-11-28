use serde::{Deserialize, Serialize};

use crate::schema::tasks;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
pub struct Task {
    pub id: String,
    pub owner: String,
    pub worker: Option<String>,
    pub status: i8, // 0: pending, 1: accepted, 2: completed, 3: accepted, 4: rejected
    pub content: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}
