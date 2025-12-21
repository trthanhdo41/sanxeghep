-- Add document image columns to driver_applications table
ALTER TABLE driver_applications
ADD COLUMN IF NOT EXISTS license_image TEXT,
ADD COLUMN IF NOT EXISTS vehicle_registration_image TEXT,
ADD COLUMN IF NOT EXISTS id_card_image TEXT;

COMMENT ON COLUMN driver_applications.license_image IS 'URL ảnh bằng lái xe (GPLX)';
COMMENT ON COLUMN driver_applications.vehicle_registration_image IS 'URL ảnh đăng ký xe (cavet)';
COMMENT ON COLUMN driver_applications.id_card_image IS 'URL ảnh CCCD/CMND (tùy chọn)';
