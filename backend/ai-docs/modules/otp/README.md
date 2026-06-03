# Module: otp

> Tài liệu trạng thái sống — cập nhật khi đóng session.

---

## Mô tả

Module OTP xử lý xác thực booking công khai qua email. Khách tạo booking từ landing page qua endpoint request OTP, hệ thống tạo booking ở trạng thái `PENDING_OTP`, gửi mã 6 số qua provider đã cấu hình, và chỉ chuyển booking sang `CONFIRMED` khi verify đúng mã.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/otp`
- **API:** `POST /public/bookings/request-otp`, `POST /public/bookings/verify-otp`, `POST /public/bookings/resend-otp`
- **Module liên quan:** `booking`, `customer`, `service`, `staff-service-assignment`

---

## Hiện trạng

### API đã cài đặt

| Method | Path | Mô tả |
|---|---|---|
| POST | `/public/bookings/request-otp` | Tạo booking `PENDING_OTP` và gửi OTP qua provider |
| POST | `/public/bookings/verify-otp` | Xác thực OTP và chuyển booking sang `CONFIRMED` |
| POST | `/public/bookings/resend-otp` | Gửi lại OTP sau cooldown 120 giây |

### Schema chính

- `otp_codes.bookingId` — booking được gắn OTP.
- `otp_codes.email` — email nhận OTP tại thời điểm gửi.
- `otp_codes.codeHash` — hash bcrypt của mã OTP, không lưu plaintext.
- `otp_codes.expiresAt` — thời điểm hết hạn, có TTL index.
- `otp_codes.attemptCount` — số lần nhập sai.
- `otp_codes.isUsed` — đánh dấu OTP đã dùng hoặc đã vô hiệu.
- `otp_codes.lastSentAt` — phục vụ cooldown resend.

### Quyết định kỹ thuật quan trọng

- `OTP_PROVIDER=console` dùng cho dev, `OTP_PROVIDER=email` dùng Gmail qua Nodemailer.
- OTP lưu dạng hash bcrypt trong collection `otp_codes`; booking chỉ giữ metadata `otpExpiresAt` và `otpAttempts`.
- Sai OTP đủ 3 lần sẽ hủy booking để giải phóng slot.
- Booking operator vẫn tạo thẳng `CONFIRMED`; OTP chỉ áp dụng cho luồng public mới.

### Việc còn lại

- [ ] Smoke test Gmail thật với `OTP_PROVIDER=email`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`.
- [ ] FE landing chuyển từ submit booking thẳng sang flow request OTP → nhập OTP → verify/resend.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-30_001_Khang.md](2026-05-30_001_Khang.md) | 2026-05-30 | Khang | Hoàn thành backend OTP booking qua provider console/Gmail |
