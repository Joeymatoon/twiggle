-- Add is_link column to headers table
ALTER TABLE public.headers
ADD COLUMN IF NOT EXISTS is_link boolean DEFAULT false;

-- Update existing rows to set is_link based on the content
UPDATE public.headers
SET is_link = true
WHERE content LIKE 'http%' OR content LIKE 'https%';

-- Add comment to the column
COMMENT ON COLUMN public.headers.is_link IS 'Indicates whether the header is a link or not'; 