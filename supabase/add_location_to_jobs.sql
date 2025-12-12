-- Add location fields to jobs table for filtering
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS region_code text REFERENCES public.regions(code),
ADD COLUMN IF NOT EXISTS city text;

-- Optional: Create index for faster filtering
-- CREATE INDEX idx_jobs_region_city ON jobs(region_code, city);
