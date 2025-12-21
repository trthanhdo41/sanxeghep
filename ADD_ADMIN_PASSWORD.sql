-- Add admin_password column to users table for admin authentication
-- This adds a second layer of security for admin accounts

-- Add admin_password column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'admin_password'
  ) THEN
    ALTER TABLE users ADD COLUMN admin_password TEXT;
  END IF;
END $$;

-- Set default admin password for existing admin users
-- Password: sanxeghep@123
UPDATE users 
SET admin_password = 'sanxeghep@123'
WHERE role = 'admin' AND admin_password IS NULL;

-- Add comment
COMMENT ON COLUMN users.admin_password IS 'Admin password for second layer authentication (only for admin role)';
