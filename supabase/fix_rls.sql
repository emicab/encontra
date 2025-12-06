-- Allow anonymous inserts, updates, and deletes for venues
create policy "Enable insert for everyone" on venues for insert with check (true);
create policy "Enable update for everyone" on venues for update using (true);
create policy "Enable delete for everyone" on venues for delete using (true);

-- Allow anonymous inserts, updates, and deletes for coupons
create policy "Enable insert for everyone" on coupons for insert with check (true);
create policy "Enable update for everyone" on coupons for update using (true);
create policy "Enable delete for everyone" on coupons for delete using (true);
