-- Enable write access to venues table
-- WARN: For development simplicity, we are enabling public write access. 
-- In production, this should be restricted to admins only.

CREATE POLICY "Enable insert for all users" ON venues FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON venues FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON venues FOR DELETE USING (true);
