-- Your SQL goes here
CREATE TABLE tasks (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  owner VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(1023) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL,
  worker VARCHAR(255),
  status TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)