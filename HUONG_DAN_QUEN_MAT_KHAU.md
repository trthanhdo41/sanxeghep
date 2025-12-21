# Hướng dẫn cài đặt tính năng Quên mật khẩu

## Bước 1: Chạy Migration trong Supabase

1. Đăng nhập vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)
4. Copy toàn bộ nội dung file `supabase/migrations/20241219_create_password_reset_requests.sql`
5. Paste vào SQL Editor và click **Run**

## Bước 2: Kiểm tra

Sau khi chạy migration thành công, bạn sẽ có:
- Table `password_reset_requests` để lưu yêu cầu đặt lại mật khẩu
- RLS policies để bảo mật dữ liệu

## Bước 3: Test tính năng

### User gửi yêu cầu:
1. Vào trang chủ, click "Đăng nhập"
2. Click "Quên mật khẩu?"
3. Điền thông tin:
   - Số điện thoại (đã đăng ký)
   - Họ và tên
   - Email (tùy chọn)
   - Lý do (tùy chọn)
4. Click "Gửi yêu cầu"

### Admin xử lý:
1. Đăng nhập với tài khoản admin
2. Vào Dashboard admin
3. Click card "Yêu cầu đặt lại MK" (màu đỏ)
4. Xem danh sách yêu cầu
5. Click "Xử lý" trên yêu cầu cần xử lý
6. Nhập mật khẩu mới (tối thiểu 6 ký tự)
7. Click "Duyệt & Cấp MK"
8. Liên hệ user qua SĐT/Email để thông báo mật khẩu mới

## Lưu ý:

- Mật khẩu mới sẽ được hash bằng bcrypt trước khi lưu vào database
- Admin cần ghi nhớ mật khẩu mới để thông báo cho user
- Có thể thêm ghi chú nội bộ khi xử lý yêu cầu
- User có thể đăng nhập bằng mật khẩu mới ngay sau khi admin duyệt

## Flow hoàn chỉnh:

```
User quên MK 
  → Gửi yêu cầu (phone, tên, email, lý do)
  → Admin nhận thông báo
  → Admin xác minh thông tin
  → Admin cấp mật khẩu mới
  → Admin liên hệ user qua SĐT/Email
  → User đăng nhập bằng mật khẩu mới
  → User đổi mật khẩu trong Profile (khuyến nghị)
```

## Tính năng đã bỏ:

- ❌ OTP qua SMS (tốn phí, phức tạp)
- ❌ Tự động reset mật khẩu
- ❌ Email tự động

## Tính năng hiện tại:

- ✅ Form đơn giản, dễ sử dụng
- ✅ Admin xử lý thủ công (kiểm soát tốt hơn)
- ✅ Không tốn phí SMS
- ✅ Bảo mật cao (admin xác minh)
