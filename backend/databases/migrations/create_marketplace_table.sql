-- Create marketplace items table
CREATE TABLE IF NOT EXISTS "marketplace_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "created_by" UUID REFERENCES auth.users(id)
);

-- Add RLS policies for marketplace_items
ALTER TABLE "marketplace_items" ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access for all users" 
ON "marketplace_items" 
FOR SELECT 
USING (true);

-- Allow insert/update/delete only for admins
CREATE POLICY "Allow admin full access" 
ON "marketplace_items" 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
); 