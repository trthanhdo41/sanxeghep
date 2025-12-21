-- Create site_settings table for managing site content
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'contact', 'legal', 'company', 'footer'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value, description, category) VALUES
  -- Contact Info
  ('contact_hotline', '0857 994 994', 'Số hotline', 'contact'),
  ('contact_email', 'support@sanxeghep.vn', 'Email hỗ trợ', 'contact'),
  ('contact_address', 'Thôn 8, Xã Thanh Hà, TP Hải Phòng', 'Địa chỉ công ty', 'contact'),
  ('contact_zalo', '0857 994 994', 'Số Zalo', 'contact'),
  ('contact_working_hours', '24/7 - Hỗ trợ mọi lúc', 'Giờ làm việc', 'contact'),
  
  -- Company Info
  ('company_name', 'Công ty TNHH Công Nghệ Sàn Xe Ghép', 'Tên công ty', 'company'),
  ('company_name_en', 'SAN XE GHEP TECHNOLOGY COMPANY LIMITED', 'Tên công ty (tiếng Anh)', 'company'),
  ('company_tax_code', 'xxxxxxx', 'Mã số thuế', 'company'),
  ('company_business_code', 'xxxxxxx', 'Giấy phép kinh doanh', 'company'),
  
  -- Legal Content (HTML)
  ('terms_of_service', '<h2>Điều khoản sử dụng</h2><p>Nội dung điều khoản...</p>', 'Điều khoản sử dụng', 'legal'),
  ('privacy_policy', '<h2>Chính sách bảo mật</h2><p>Nội dung chính sách...</p>', 'Chính sách bảo mật', 'legal'),
  ('general_rules', '<h2>Quy định chung</h2><p>Nội dung quy định...</p>', 'Quy định chung', 'legal'),
  ('recruitment', '<h2>Tuyển dụng</h2><p>Thông tin tuyển dụng...</p>', 'Trang tuyển dụng', 'legal')
ON CONFLICT (key) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read settings
CREATE POLICY "Anyone can view site settings" ON site_settings
  FOR SELECT USING (true);

-- Allow all operations (since we use localStorage auth)
CREATE POLICY "Allow all operations on site settings" ON site_settings
  FOR ALL USING (true);

COMMENT ON TABLE site_settings IS 'Site settings and content management';
COMMENT ON COLUMN site_settings.key IS 'Unique setting key';
COMMENT ON COLUMN site_settings.value IS 'Setting value (can be HTML for legal content)';
COMMENT ON COLUMN site_settings.category IS 'Setting category: contact, legal, company, footer';
