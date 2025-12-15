-- Add status and trial columns to venues table for Onboarding V2.0

-- 1. Status Column
-- Used to manage the approval flow: 'pending' -> 'active' (or 'rejected')
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 2. Trial End Column
-- Used to manage the automatic 30-day trial period
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS plan_trial_end timestamptz;

-- 3. Update existing venues (Optional, but good for consistency)
-- We assume existing venues are active if not specified
UPDATE venues SET status = 'active' WHERE status IS NULL;

-- 4. Create Index on Status for faster filtering in Admin Dashboard
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
