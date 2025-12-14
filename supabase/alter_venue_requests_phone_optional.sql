-- Make phone column optional in venue_requests table
ALTER TABLE venue_requests ALTER COLUMN phone DROP NOT NULL;
