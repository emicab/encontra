-- Add region_code column to venue_requests table
ALTER TABLE venue_requests ADD COLUMN IF NOT EXISTS region_code text DEFAULT 'tdf';
