-- Backfill region_code and city for existing jobs linked to venues
UPDATE public.jobs
SET 
  region_code = venues.region_code,
  city = venues.city
FROM public.venues
WHERE jobs.venue_id = venues.id
  AND jobs.region_code IS NULL;
