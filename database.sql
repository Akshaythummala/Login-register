-- Create the database
CREATE DATABASE IF NOT EXISTS auth_db;

USE auth_db;

-- Table structure is handled by Spring Data JPA (hibernate.ddl-auto=update)
-- but here is the manual SQL if needed:

/*
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
*/
