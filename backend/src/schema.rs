table! {
    images (id) {
        id -> Varchar,
        uid -> Varchar,
        tid -> Nullable<Varchar>,
        created_at -> Timestamp,
    }
}

table! {
    tasks (id) {
        id -> Varchar,
        owner -> Varchar,
        title -> Varchar,
        description -> Varchar,
        content -> Text,
        tags -> Text,
        worker -> Nullable<Varchar>,
        status -> Tinyint,
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
    tasks,
    users,
);
