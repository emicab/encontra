-- Remove strict category check constraint to allow custom categories and new types
ALTER TABLE venues DROP CONSTRAINT venues_category_check;
