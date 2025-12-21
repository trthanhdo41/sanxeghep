-- Fix passenger_requests table for phase 1 (no foreign key constraints)

-- 1. Disable RLS
ALTER TABLE passenger_requests DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON passenger_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON passenger_requests;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON passenger_requests;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON passenger_requests;

-- 3. Drop foreign key constraint (causing 409 error)
ALTER TABLE passenger_requests 
DROP CONSTRAINT IF EXISTS passenger_requests_user_id_fkey;

-- 4. Verify changes
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'passenger_requests';

-- 5. Check constraints removed
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'passenger_requests'::regclass;
