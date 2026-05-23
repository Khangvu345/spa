# Module: Booking

> Tài liệu hiện trạng của module đặt lịch và kiểm tra khung giờ trống.

---

## Mô tả

Module Booking quản lý lịch hẹn từ trang đặt lịch và từ nhân viên vận hành, tính khung giờ trống của chuyên viên, và tạo Phiếu dịch vụ khi khách check-in.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** -

---

## Liên kết

- **Mã nguồn:** `src/modules/booking`
- **Module liên quan:** `customer`, `service`, `staff-service-assignment`, `service-order`
- **Issue:** [#17](../../issues/17.md)

---

## Hiện trạng

### Endpoint đã triển khai

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/bookings/availability` | Trả tối đa 8 khung giờ gợi ý cho trang đặt lịch |
| GET | `/bookings/availability/grid` | Trả toàn bộ lưới giờ trống/bận cho nhân viên vận hành |
| POST | `/bookings` | Khách tạo lịch hẹn từ trang đặt lịch |
| POST | `/bookings/operator` | Nhân viên vận hành tạo lịch hẹn thay khách |
| GET | `/bookings` | Danh sách lịch hẹn, có lọc/tìm kiếm/sắp xếp |
| GET | `/bookings/:id` | Chi tiết lịch hẹn |
| PATCH | `/bookings/:id` | Cập nhật ghi chú hoặc chuyển trạng thái giới hạn |
| POST | `/bookings/:id/check-in` | Check-in và tạo Phiếu dịch vụ DRAFT |
| POST | `/bookings/:id/cancel` | Hủy lịch hẹn |
| POST | `/bookings/:id/no-show` | Đánh dấu khách không đến |

### Trường dữ liệu chính

- `bookingCode: string` - mã duy nhất dạng `BK-YYYYMMDD-NNNN`.
- `customerId`, `serviceId`, `staffId` - tham chiếu khách hàng, dịch vụ và chuyên viên.
- `customerSnapshot`, `serviceSnapshot`, `staffSnapshot` - dữ liệu chụp lại tại thời điểm đặt lịch.
- `scheduledStart`, `scheduledEnd` - thời gian bắt đầu/kết thúc, trong đó kết thúc = thời lượng dịch vụ + thời gian dọn dẹp.
- `status` - `PENDING_OTP`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
- `source` - `LANDING_PAGE` hoặc `OPERATOR`.
- `otpCode`, `otpExpiresAt`, `otpAttempts`, `verifiedAt` - chuẩn bị sẵn cho giai đoạn OTP.
- `serviceOrderId` - được gán khi check-in tạo Phiếu dịch vụ.
- `createdBy`, `cancelledAt`, `cancelledBy`, `cancelReason` - trường audit.

### Quyết định kỹ thuật quan trọng

- Giai đoạn 1 tạo lịch hẹn ở trạng thái `CONFIRMED` ngay, chưa bật OTP.
- `SlotAvailabilityService` là helper riêng, dùng chung cho trang đặt lịch và lưới giờ của nhân viên vận hành.
- Giờ mở cửa spa: 08:00-22:00; bước slot 30 phút; buffer giữa hai lịch của cùng chuyên viên là 15 phút.
- Booking chụp lại thời gian dọn dẹp từ `Service.bufferMinutes`.
- Check-in chạy trong transaction và gọi `ServiceOrderService.create(..., session)`.
- Sau check-in, Phiếu dịch vụ là chủ vòng đời phục vụ: SO `IN_PROGRESS`/`COMPLETED` đồng bộ Booking thành `IN_PROGRESS`/`COMPLETED`; SO `INVOICED` không đồng bộ tiếp.
- Hủy Booking theo hướng có kiểm soát: cascade hủy SO `DRAFT`/`IN_PROGRESS`, chặn SO `COMPLETED`/`INVOICED` bằng `BOOKING_CANNOT_CANCEL_SERVED`.
- `otpCode` không trả ra trong `BookingResponseDto`.

### Còn lại

- [ ] Giai đoạn 3: gửi/xác thực OTP và tự hủy khi OTP hết hạn hoặc sai quá số lần cho phép.
- [ ] Link hủy công khai bằng token.
- [ ] Khóa slot thời gian thực nếu cần giảm race condition.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-23_001_Khang.md](2026-05-23_001_Khang.md) | 2026-05-23 | Khang | Triển khai Booking và kiểm tra khung giờ trống cho issue #17 |
