-- Add multi-role support: user can be both passenger and driver
-- Replace single role column with boolean flags

-- Add new columns
ALTER TABLE public.users 
  ADD COLUMN is_passenger BOOLEAN DEFAULT TRUE,
  ADD COLUMN is_driver BOOLEAN DEFAULT FALSE;

-- Migrate existing data
UPDATE public.users 
SET 
  is_passenger = CASE WHEN role IN ('passenger', 'admin') THEN TRUE ELSE FALSE END,
  is_driver = CASE WHEN role IN ('driver', 'admin') THEN TRUE ELSE FALSE END;

-- For admin, set both to true
UPDATE public.users 
SET is_passenger = TRUE, is_driver = TRUE 
WHERE role = 'admin';

-- Keep role column for backward compatibility but make it computed
-- We'll update it via trigger
CREATE OR REPLACE FUNCTION update_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine primary role based on flags
  IF NEW.role = 'admin' THEN
    NEW.role := 'admin';
  ELSIF NEW.is_driver THEN
    NEW.role := 'driver';
  ELSIF NEW.is_passenger THEN
    NEW.role := 'passenger';
  ELSE
    NEW.role := 'user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_role 
  BEFORE INSERT OR UPDATE OF is_passenger, is_driver 
  ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION update_user_role();

-- Add index for better performance
CREATE INDEX idx_users_is_driver ON public.users(is_driver) WHERE is_driver = TRUE;
CREATE INDEX idx_users_is_passenger ON public.users(is_passenger) WHERE is_passenger = TRUE;
