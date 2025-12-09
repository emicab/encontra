-- Create table for venue requests (leads)
CREATE TABLE IF NOT EXISTS venue_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  custom_category text,
  description text,
  hours text,
  location text,
  location_type text,
  phone text NOT NULL, -- Added phone number as required
  visibility text,
  friction text,
  security text,
  region_code text DEFAULT 'tdf',
  zone text,
  -- Expanded fields
  slug text,
  image text,
  logo text,
  website text,
  instagram text,
  facebook text,
  whatsapp text,
  open_time text,
  close_time text,
  days_open jsonb,
  coordinates jsonb,
  venue_type text,
  subscription_plan text DEFAULT 'free',
  service_delivery boolean DEFAULT false,
  service_pickup boolean DEFAULT false,
  service_arrangement boolean DEFAULT false,
  street text,
  house_number text,
  city text,
  status text DEFAULT 'pending' -- pending, contacted, rejected, approved
);

-- Enable RLS
ALTER TABLE venue_requests ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (submit form)
CREATE POLICY "Enable insert for everyone" ON venue_requests FOR INSERT WITH CHECK (true);

-- Allow admins to view all (assuming admin auth is handled, for now allow all for dev or restrict if auth is set up)
-- For simplicity in this demo, we might allow read for now or just authenticated. 
-- Let's assume the admin page will use the supabase client which might be anon for now or authenticated.
-- Let's allow select for everyone for now to ensure the admin page works without complex auth setup in this demo phase.
CREATE POLICY "Enable select for everyone" ON venue_requests FOR SELECT USING (true);
CREATE POLICY "Enable update for everyone" ON venue_requests FOR UPDATE USING (true);
