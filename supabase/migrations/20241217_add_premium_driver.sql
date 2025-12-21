-- Add premium driver features
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Create index for premium check
CREATE INDEX IF NOT EXISTS idx_users_premium ON public.users(is_premium, premium_expires_at);

-- Add comment
COMMENT ON COLUMN public.users.is_premium IS 'Tài xế VIP - không giới hạn số chuyến đăng';
COMMENT ON COLUMN public.users.premium_expires_at IS 'Ngày hết hạn VIP (null = vĩnh viễn)';
