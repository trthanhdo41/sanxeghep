# Hướng dẫn tích hợp OTP - Quên mật khẩu

## Đã hoàn thành

### 1. Cấu hình eSMS API
- ✅ Đã thêm API Key và Secret Key vào `.env.local`
- ✅ API Key: `616AFDB2E047E62CB4911D03AB74D0`
- ✅ Secret Key: `2CBD873AB252B7E141385C87C4B87E`

### 2. Database Migration
- ✅ Tạo bảng `otp_codes` để lưu mã OTP
- ✅ File: `supabase/migrations/20241219_create_otp_codes.sql`

**Cần chạy migration này trong Supabase SQL Editor:**
```sql
-- Chạy file: supabase/migrations/20241219_create_otp_codes.sql
```

### 3. API Routes
- ✅ `/api/auth/send-otp` - Gửi mã OTP qua SMS
- ✅ `/api/auth/verify-otp` - Xác thực OTP và đặt lại mật khẩu

### 4. UI Components
- ✅ `ForgotPasswordModal` - Modal quên mật khẩu
- ✅ Tích hợp vào `AuthModal` với nút "Quên mật khẩu?"

## Cách sử dụng

### Cho người dùng:
1. Click "Đăng nhập" trên header
2. Click "Quên mật khẩu?" dưới form đăng nhập
3. Nhập số điện thoại đã đăng ký
4. Click "Gửi mã OTP"
5. Nhận mã OTP qua SMS (6 số)
6. Nhập mã OTP và mật khẩu mới
7. Click "Xác nhận" để đặt lại mật khẩu

### Quy trình kỹ thuật:
1. User nhập số điện thoại
2. Hệ thống kiểm tra số điện thoại có tồn tại không
3. Tạo mã OTP 6 số ngẫu nhiên
4. Lưu OTP vào database với thời hạn 5 phút
5. Gửi OTP qua eSMS API
6. User nhập OTP và mật khẩu mới
7. Hệ thống xác thực OTP (chưa hết hạn, chưa sử dụng)
8. Hash mật khẩu mới và cập nhật vào database
9. Đánh dấu OTP đã sử dụng

## Tính năng

### Bảo mật:
- ✅ Mã OTP 6 số ngẫu nhiên
- ✅ Thời hạn 5 phút
- ✅ Chỉ sử dụng được 1 lần
- ✅ Mật khẩu được hash bằng bcrypt
- ✅ RLS policy: chỉ server-side mới truy cập được bảng otp_codes

### UX:
- ✅ Countdown 60s trước khi có thể gửi lại OTP
- ✅ Nút "Gửi lại mã OTP" sau khi hết countdown
- ✅ Hiển thị số điện thoại đã nhập
- ✅ Validation đầy đủ (số điện thoại, mật khẩu, xác nhận mật khẩu)
- ✅ Nút ẩn/hiện mật khẩu
- ✅ Toast notifications cho mọi action

## Cấu hình Vercel

Cần thêm Environment Variables trong Vercel:
```
ESMS_API_KEY=616AFDB2E047E62CB4911D03AB74D0
ESMS_SECRET_KEY=2CBD873AB252B7E141385C87C4B87E
```

## Lưu ý

1. **Chi phí SMS**: Mỗi tin nhắn OTP sẽ tính phí theo gói dịch vụ eSMS
2. **Rate limiting**: Nên thêm rate limiting để tránh spam OTP
3. **Brandname**: Tin nhắn sẽ hiển thị từ "SanXeGhep"
4. **Testing**: Test kỹ trước khi deploy production

## Troubleshooting

### Không nhận được OTP:
- Kiểm tra số điện thoại đã đăng ký chưa
- Kiểm tra API Key và Secret Key
- Kiểm tra logs trong Vercel
- Kiểm tra tài khoản eSMS còn credit không

### OTP không hợp lệ:
- Kiểm tra OTP đã hết hạn chưa (5 phút)
- Kiểm tra OTP đã được sử dụng chưa
- Kiểm tra nhập đúng 6 số

### Không thể đặt lại mật khẩu:
- Kiểm tra mật khẩu mới >= 6 ký tự
- Kiểm tra mật khẩu xác nhận khớp
- Kiểm tra database connection
