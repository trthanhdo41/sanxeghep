-- Create passenger_requests table
CREATE TABLE IF NOT EXISTS passenger_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1,
  luggage TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_passenger_requests_user_id ON passenger_requests(user_id);
CREATE INDEX idx_passenger_requests_status ON passenger_requests(status);
CREATE INDEX idx_passenger_requests_date ON passenger_requests(date);
CREATE INDEX idx_passenger_requests_locations ON passenger_requests(from_location, to_location);

-- Enable RLS
ALTER TABLE passenger_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all active requests"
  ON passenger_requests FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can insert their own requests"
  ON passenger_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
  ON passenger_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests"
  ON passenger_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_passenger_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER passenger_requests_updated_at
  BEFORE UPDATE ON passenger_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_passenger_requests_updated_at();
