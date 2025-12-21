-- Fix role constraint to allow 'user', 'driver', 'admin'
-- Run this if you get error: violates check constraint "users_role_check"

-- 1. Drop old constraint if exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add new constraint with correct values
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'driver', 'admin'));

-- 3. Verify constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname = 'users_role_check';

-- 4. Test insert (should work now)
-- INSERT INTO users (id, phone, full_name, role) 
-- VALUES (gen_random_uuid(), '0999999999', 'Test User', 'user');
