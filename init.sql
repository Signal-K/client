-- Database initialization script for PostgreSQL
-- This file will be executed when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (not needed since we specify it in docker-compose)
-- CREATE DATABASE IF NOT EXISTS navigation;

-- Create any initial tables or data if needed
-- The actual schema will be managed by Drizzle migrations

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- You can add any other initialization SQL here
-- For example, creating initial roles, setting up permissions, etc.

COMMENT ON DATABASE navigation IS 'Navigation application database';
