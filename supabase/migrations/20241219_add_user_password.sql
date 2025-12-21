-- Add password column for all users (not just admin)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing users to have a default password (they will need to set it on next login)
-- Admin password stays in admin_password column
UPDATE users SET password = NULL WHERE password IS NULL AND role != 'admin';

COMMENT ON COLUMN users.password IS 'User password for authentication (all users)';
COMMENT ON COLUMN users.admin_password IS 'Admin password (legacy, only for admin role)';
