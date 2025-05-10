-- Add is_admin column to users table
ALTER TABLE IF EXISTS "users" 
ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN DEFAULT FALSE; 