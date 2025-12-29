-- Migration to create the missing iceberg_namespaces table for Supabase Storage
CREATE TABLE IF NOT EXISTS public.iceberg_namespaces (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb
);
