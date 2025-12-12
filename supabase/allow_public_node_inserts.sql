-- Allow unauthenticated (public) users to insert jobs, BUT strictly enforcing is_active = false
-- This allows the "Public Job Board" feature to work without login.

CREATE POLICY "Public can insert inactive jobs" ON jobs
  FOR INSERT
  WITH CHECK (is_active = false);
