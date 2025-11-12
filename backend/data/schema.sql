-- SQL schema for auth (users table)
-- Run this on your Postgres database before starting the server (if you plan to use Postgres)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'tourist',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  avatar_url TEXT,
  bio TEXT,
  motto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
