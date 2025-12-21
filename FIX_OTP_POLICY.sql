-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Service role only" ON otp_codes;
DROP POLICY IF EXISTS "Service role full access" ON otp_codes;

-- Tạo policy mới cho phép service role full access
CREATE POLICY "Service role full access" ON otp_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Kiểm tra bảng đã tạo chưa
SELECT * FROM otp_codes LIMIT 1;
