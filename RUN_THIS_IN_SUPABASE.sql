-- Chỉ cần chạy phần policy này thôi

-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Service role only" ON otp_codes;
DROP POLICY IF EXISTS "Service role full access" ON otp_codes;

-- Tạo policy mới cho phép service role full access
CREATE POLICY "Service role full access" ON otp_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Kiểm tra xem policy đã được tạo chưa
SELECT * FROM pg_policies WHERE tablename = 'otp_codes';
