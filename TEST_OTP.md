# Test OTP Feature

## Bước 1: Chạy Migration trong Supabase

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project: wytdgrkfwzhlhigffapn
3. Vào SQL Editor
4. Copy và chạy SQL sau:

```sql
-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Service role only" ON otp_codes;

-- Policy: Không cho phép truy cập trực tiếp từ client
CREATE POLICY "Service role only" ON otp_codes
  FOR ALL
  USING (false);
```

## Bước 2: Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

## Bước 3: Test

1. Mở trang web: http://localhost:3000
2. Click "Đăng nhập"
3. Click "Quên mật khẩu?"
4. Nhập số điện thoại đã đăng ký (ví dụ: 0857994994)
5. Click "Gửi mã OTP"
6. Kiểm tra SMS trên điện thoại
7. Nhập mã OTP và mật khẩu mới
8. Click "Xác nhận"

## Troubleshooting

### Lỗi 404:
- Restart dev server
- Xóa folder `.next` và chạy lại `npm run dev`

### Lỗi 500:
- Kiểm tra đã chạy migration chưa
- Kiểm tra logs trong terminal
- Kiểm tra `.env.local` có đầy đủ keys chưa

### Không nhận được SMS:
- Kiểm tra tài khoản eSMS còn credit không
- Kiểm tra API keys đúng chưa
- Kiểm tra số điện thoại đã đăng ký trong hệ thống chưa

## Debug API

Test API trực tiếp:

```bash
# Test send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"0857994994"}'

# Test verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"0857994994","otp":"123456","newPassword":"newpass123"}'
```
