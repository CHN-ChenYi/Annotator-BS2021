table! {
    images (id) {
        id -> Varchar,
        uid -> Varchar,
        tid -> Nullable<Varchar>,
        created_at -> Timestamp,
    }
}

table! {
    tags (id) {
        id -> Varchar,
        tid -> Varchar,
        content -> Varchar,
    }
}

table! {
    tasks (id) {
        id -> Varchar,
        owner -> Varchar,
        worker -> Nullable<Varchar>,
        status -> Tinyint,
        content -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    users (id) {
        id -> Varchar,
        email -> Varchar,
        username -> Varchar,
        password -> Varchar,
    }
}

allow_tables_to_appear_in_same_query!(
    images,
    tags,
    tasks,
    users,
);
