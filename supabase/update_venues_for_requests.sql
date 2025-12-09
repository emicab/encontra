-- Update venues table to support enhanced request flow fields

ALTER TABLE venues
ADD COLUMN IF NOT EXISTS logo text,
ADD COLUMN IF NOT EXISTS custom_category text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region_code text,
ADD COLUMN IF NOT EXISTS hours text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false; -- Adding is_verified as it is useful

-- Optional: If we want to allow text for name/description in future, we might alter them,
-- but for now we will handle JSONB structure in the application code.
