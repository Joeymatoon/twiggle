-- Add template field to users table
ALTER TABLE users ADD COLUMN template VARCHAR(50) DEFAULT 'default';
 
-- Update existing users to use default template
UPDATE users SET template = 'default' WHERE template IS NULL; 