-- Create banners table for ads management
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL, -- Stores HTML/Google Ads code (not actual image URL)
  link_url TEXT, -- Not used anymore, kept for backward compatibility
  position TEXT NOT NULL DEFAULT 'home_top', -- home_top, home_middle, home_bottom
  category TEXT, -- Optional category/danh mục
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON banners(sort_order);

-- Add RLS policies (disable for now since we use custom auth)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
DROP POLICY IF EXISTS "Allow all operations on banners" ON banners;

-- Allow public to read active banners
CREATE POLICY "Anyone can view active banners" ON banners
  FOR SELECT USING (is_active = true);

-- Allow all operations without auth (since we use localStorage auth)
CREATE POLICY "Allow all operations on banners" ON banners
  FOR ALL USING (true);

COMMENT ON TABLE banners IS 'Banner/Ads management system - stores HTML/Google Ads code';
COMMENT ON COLUMN banners.image_url IS 'HTML/Google Ads code (not image URL)';
COMMENT ON COLUMN banners.position IS 'Banner position: home_top, home_middle, home_bottom';
COMMENT ON COLUMN banners.sort_order IS 'Display order (lower number = higher priority)';
