-- Add session management for drivers
-- Only drivers are restricted to single device login

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active_session_id TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_users_active_session ON users(active_session_id) WHERE active_session_id IS NOT NULL;

COMMENT ON COLUMN users.active_session_id IS 'Unique session ID for single device login (drivers only)';
COMMENT ON COLUMN users.last_active_at IS 'Last activity timestamp for session validation';
