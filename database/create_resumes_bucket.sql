-- 1. Create the 'resumes' bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- 2. Enable RLS policy to allow anyone to upload a CV (insert)
-- Drop policy if exists to avoid errors on re-run
drop policy if exists "Public Access to Upload Resumes" on storage.objects;
create policy "Public Access to Upload Resumes"
on storage.objects for insert
with check ( bucket_id = 'resumes' );

-- 3. Enable RLS policy to allow reading the CV (select)
drop policy if exists "Public Access to Read Resumes" on storage.objects;
create policy "Public Access to Read Resumes"
on storage.objects for select
using ( bucket_id = 'resumes' );

-- 4. Enable Auto-Cleanup (Optional, needs pg_cron extension)
-- Tries to schedule a daily job to delete files older than 7 days.
-- If pg_cron is not enabled, this part might fail or simply not run.
-- You can enable pg_cron in Database -> Extensions in Supabase dashboard.

/*
select cron.schedule(
  'cleanup-resumes', -- name
  '0 0 * * *', -- everyday at midnight
  $$delete from storage.objects where bucket_id = 'resumes' and created_at < now() - interval '7 days'$$
);
*/

-- IMPORTANT: To run the cleanup, uncomment the block above IF you have pg_cron enabled.
