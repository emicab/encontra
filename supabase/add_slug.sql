-- Add slug column to venues table
alter table venues add column slug text;

-- Create a unique index on slug
create unique index venues_slug_idx on venues (slug);

-- Update existing venues to have a slug (using id as fallback for now to avoid nulls)
update venues set slug = id::text where slug is null;

-- Now make it not null (optional, but good practice if we want to enforce it)
alter table venues alter column slug set not null;
