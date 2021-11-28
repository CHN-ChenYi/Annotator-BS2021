use serde::{Deserialize, Serialize};

use crate::schema::tasks;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
pub struct Task {
    pub id: String,
    pub owner: String,
    pub title: String,
    pub description: String,
    pub content: String,
    pub tags: String,
    pub worker: Option<String>,
    pub status: i8, // 0: pending, 1: accepted, 2: completed, 3: accepted, 4: rejected
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewTaskImage {
    pub iid: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewTask {
    pub title: String,
    pub description: String,
    pub images: Vec<NewTaskImage>,
    pub tags: String,
}
