-- Secure RLS Policies v2
-- This migration tightens security by removing permissive development policies
-- and strictly enforcing Admin-only write access for core tables.

-- ==============================================================================
-- 1. Venues Table
--    - Public Read: Allowed
--    - Write (Insert/Update/Delete): Admin Only
-- ==============================================================================

-- Drop existing permissive policies if they exist (names from fix_rls.sql / schema.sql)
DROP POLICY IF EXISTS "Public venues are viewable by everyone" ON venues;
DROP POLICY IF EXISTS "Enable insert for everyone" ON venues;
DROP POLICY IF EXISTS "Enable update for everyone" ON venues;
DROP POLICY IF EXISTS "Enable delete for everyone" ON venues;

-- Create new strict policies
CREATE POLICY "Public venues are viewable by everyone" 
ON venues FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert venues" 
ON venues FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update venues" 
ON venues FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete venues" 
ON venues FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);


-- ==============================================================================
-- 2. Coupons Table
--    - Public Read: Allowed
--    - Write (Insert/Update/Delete): Admin Only
-- ==============================================================================

DROP POLICY IF EXISTS "Public coupons are viewable by everyone" ON coupons;
DROP POLICY IF EXISTS "Enable insert for everyone" ON coupons;
DROP POLICY IF EXISTS "Enable update for everyone" ON coupons;
DROP POLICY IF EXISTS "Enable delete for everyone" ON coupons;

CREATE POLICY "Public coupons are viewable by everyone" 
ON coupons FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert coupons" 
ON coupons FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update coupons" 
ON coupons FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete coupons" 
ON coupons FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);


-- ==============================================================================
-- 3. Venue Requests Table (Leads)
--    - Public Insert: Allowed (Lead generation form)
--    - Read/Update/Delete: Admin Only
-- ==============================================================================

DROP POLICY IF EXISTS "Enable insert for everyone" ON venue_requests;
DROP POLICY IF EXISTS "Enable select for everyone" ON venue_requests;
DROP POLICY IF EXISTS "Enable update for everyone" ON venue_requests;

-- Allow anyone to submit a request (no auth required for leads)
CREATE POLICY "Enable insert for everyone" 
ON venue_requests FOR INSERT 
WITH CHECK (true);

-- Only admins can view requests
CREATE POLICY "Admins can view venue_requests" 
ON venue_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Only admins can update requests (e.g. status change)
CREATE POLICY "Admins can update venue_requests" 
ON venue_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Only admins can delete requests
CREATE POLICY "Admins can delete venue_requests" 
ON venue_requests FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);


-- ==============================================================================
-- 4. Jobs Table
--    - Public Read: Allowed
--    - Write (Insert/Update/Delete): Admin Only
--      (Overriding previous implementation that allowed "Owner" to edit. 
--       Assuming current model is Admin-managed jobs.)
-- ==============================================================================

DROP POLICY IF EXISTS "Public jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;

CREATE POLICY "Public jobs are viewable by everyone" 
ON jobs FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can insert jobs" 
ON jobs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update jobs" 
ON jobs FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete jobs" 
ON jobs FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);
