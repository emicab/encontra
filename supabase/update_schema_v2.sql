-- Add new columns to venues table for location flexibility and venue type
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS venue_type text DEFAULT 'physical_store', -- 'physical_store', 'entrepreneur', 'service'
ADD COLUMN IF NOT EXISTS location_mode text DEFAULT 'exact_address', -- 'exact_address', 'zone'
ADD COLUMN IF NOT EXISTS zone text;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name jsonb NOT NULL, -- Multi-language name {es: "...", en: "..."}
  description jsonb, -- Multi-language description
  price numeric, -- Optional price
  image text,
  is_active boolean DEFAULT true
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for reading products (public)
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- Policy for inserting/updating/deleting products (public for now as per previous setup, or authenticated)
-- Keeping it consistent with previous "public write" for demo purposes, or better, just public write for now to avoid auth issues during dev.
CREATE POLICY "Enable all access for all users" 
ON products FOR ALL 
USING (true) 
WITH CHECK (true);
