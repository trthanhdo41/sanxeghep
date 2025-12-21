-- Tạm thời tắt RLS để test
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- Kiểm tra
SELECT * FROM otp_codes LIMIT 5;
