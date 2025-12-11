-- Create Enums
DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_location_type AS ENUM ('onsite', 'remote', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  company_name text,
  company_logo text,
  title text NOT NULL,
  description jsonb NOT NULL,
  salary_min numeric,
  salary_max numeric,
  currency text DEFAULT 'ARS',
  job_type text NOT NULL DEFAULT 'full_time',
  location_type text NOT NULL DEFAULT 'onsite',
  contact_email text NOT NULL,
  is_active boolean DEFAULT true,
  application_count integer DEFAULT 0,
  slug text UNIQUE
);

-- RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 1. Public Read
DROP POLICY IF EXISTS "Public jobs are viewable by everyone" ON jobs;
CREATE POLICY "Public jobs are viewable by everyone" ON jobs
  FOR SELECT USING (is_active = true);

-- 2. Create (Authenticated)
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON jobs;
CREATE POLICY "Authenticated users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Update (Owner)
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
CREATE POLICY "Users can update their own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = owner_id);

-- 4. Delete (Owner)
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
CREATE POLICY "Users can delete their own jobs" ON jobs
  FOR DELETE USING (auth.uid() = owner_id);
