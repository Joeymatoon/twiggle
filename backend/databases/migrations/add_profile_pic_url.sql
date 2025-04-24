-- Add profile_pic_url column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_pic_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.users.profile_pic_url IS 'URL of the user''s profile picture'; 