-- Add bio column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.users.bio IS 'User''s biography or description'; 