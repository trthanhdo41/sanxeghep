-- Add role system to users table (Safe to run multiple times)

-- 1. Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- 2. Add check constraint for valid roles (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('user', 'driver', 'admin'));
  END IF;
END $$;

-- 3. Update existing users to 'user' role if NULL
UPDATE users 
SET role = 'user' 
WHERE role IS NULL;

-- 4. Add is_driver_verified column for driver verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_driver_verified BOOLEAN DEFAULT false;

-- 5. Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_driver_verified ON users(is_driver_verified);

-- 6. Verify changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('role', 'is_driver_verified');

-- 7. Check current roles
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Example: Set a user as driver
-- UPDATE users SET role = 'driver', is_driver_verified = true WHERE phone = '0123456789';

-- Example: Set a user as admin
-- UPDATE users SET role = 'admin' WHERE phone = '0857994994';
