-- Drop the old islink column if it exists
ALTER TABLE public.headers DROP COLUMN IF EXISTS islink;

-- Make sure we have the correct is_link column
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS is_link boolean DEFAULT false;

-- Make sure we have all required columns with correct types
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS active boolean DEFAULT false;
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.headers ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS headers_user_id_idx ON public.headers(user_id);
CREATE INDEX IF NOT EXISTS headers_position_idx ON public.headers(position);

-- Set up RLS policies
ALTER TABLE public.headers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own headers" ON public.headers;
DROP POLICY IF EXISTS "Users can insert their own headers" ON public.headers;
DROP POLICY IF EXISTS "Users can update their own headers" ON public.headers;
DROP POLICY IF EXISTS "Users can delete their own headers" ON public.headers;

-- Create policies
CREATE POLICY "Users can view their own headers"
    ON public.headers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own headers"
    ON public.headers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own headers"
    ON public.headers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own headers"
    ON public.headers FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_headers_updated_at ON public.headers;
CREATE TRIGGER handle_headers_updated_at
    BEFORE UPDATE ON public.headers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 