-- Expand venue_requests to store full venue details for direct approval
ALTER TABLE venue_requests 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS image text, -- Cover image (Plan Full)
ADD COLUMN IF NOT EXISTS logo text,  -- Profile image (All plans)
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS facebook text,
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS open_time text,
ADD COLUMN IF NOT EXISTS close_time text,
ADD COLUMN IF NOT EXISTS days_open jsonb, -- For specific schedule
ADD COLUMN IF NOT EXISTS coordinates jsonb, -- {lat, lng}
ADD COLUMN IF NOT EXISTS venue_type text, -- physical, entrepreneur, service
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free', -- vecino, basic, premium
ADD COLUMN IF NOT EXISTS service_delivery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_pickup boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_arrangement boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS house_number text,
ADD COLUMN IF NOT EXISTS city text;
