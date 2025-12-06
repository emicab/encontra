-- Add schedule and service options to venues table
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS schedule jsonb, -- Stores the weekly schedule with multiple shifts
ADD COLUMN IF NOT EXISTS service_delivery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_pickup boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_arrangement boolean DEFAULT false;
