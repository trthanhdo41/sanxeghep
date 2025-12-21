-- Create password reset requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_password_reset_requests_user_id ON password_reset_requests(user_id);
CREATE INDEX idx_password_reset_requests_phone ON password_reset_requests(phone);
CREATE INDEX idx_password_reset_requests_status ON password_reset_requests(status);

-- Enable RLS
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own requests
CREATE POLICY "Users can create password reset requests" ON password_reset_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own password reset requests" ON password_reset_requests
  FOR SELECT
  USING (auth.uid() = user_id OR phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- Policy: Service role full access
CREATE POLICY "Service role full access on password reset" ON password_reset_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
