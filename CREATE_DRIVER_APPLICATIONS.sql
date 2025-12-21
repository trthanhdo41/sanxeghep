-- Create driver_applications table for driver registration requests

CREATE TABLE IF NOT EXISTS driver_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  license_plate VARCHAR(50) NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  experience_years INTEGER,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_driver_applications_user_id ON driver_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_applications_status ON driver_applications(status);
CREATE INDEX IF NOT EXISTS idx_driver_applications_created_at ON driver_applications(created_at DESC);

-- Add comments
COMMENT ON TABLE driver_applications IS 'Driver registration applications';
COMMENT ON COLUMN driver_applications.status IS 'Application status: pending, approved, rejected';
COMMENT ON COLUMN driver_applications.reviewed_by IS 'Admin who reviewed the application';

-- Disable RLS for phase 1
ALTER TABLE driver_applications DISABLE ROW LEVEL SECURITY;
