# Module: customer

> Living state document — cập nhật khi đóng session ⚠️. AI đọc đây thay vì replay logs.

---

## Mô tả

Module quản lý khách hàng nội bộ và customer từ booking landing page. Khách hàng được định danh bằng `phone` duy nhất; không có tài khoản đăng nhập riêng.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/customer`
- **API spec:** Swagger tag `Customers`
- **Related modules:** `booking`, `invoice`, `auth/employee`

---

## Hiện trạng (Current Snapshot)

> Đây là source of truth cho "module hiện trạng". Cập nhật khi đóng session ⚠️.

### Endpoints đã implement

| Method | Path | Mô tả |
|---|---|---|
| POST | `/customers` | Tạo khách hàng mới, JWT `OPERATOR`/`ADMIN` |
| POST | `/customers/find-or-create` | Public upsert theo phone cho booking landing page |
| GET | `/customers` | Danh sách với pagination, search, filter, sort; mọi role JWT |
| GET | `/customers/by-phone/:phone` | Tra cứu nhanh theo SĐT, JWT `OPERATOR`/`ADMIN` |
| GET | `/customers/:id` | Chi tiết khách hàng, mọi role JWT |
| PATCH | `/customers/:id` | Cập nhật thông tin, JWT `OPERATOR`/`ADMIN`; `phone` bị ignore |
| PATCH | `/customers/:id/toggle-active` | Bật/tắt `isActive`, JWT `ADMIN` |

### Schema fields chính

- `fullName: string` — tên khách, required.
- `phone: string` — 10 chữ số VN, unique, natural key.
- `email: string` — optional, default `''`.
- `source: WALK_IN | ONLINE_BOOKING | MANUAL` — nguồn khách.
- `note: string` — optional, default `''`.
- `phoneVerified: boolean` — default `false`, chuẩn bị cho OTP phase 3.
- `emailVerified: boolean` — default `false`, chuẩn bị cho OTP phase 3.
- `lastVerifiedAt: Date | null` — default `null`.
- `isActive: boolean` — soft delete/blacklist flag, default `true`.
- `created_at`, `updated_at` — timestamps do Mongoose quản lý.

### Quyết định kỹ thuật quan trọng

- Không có `DELETE`; vô hiệu hóa bằng `PATCH /customers/:id/toggle-active`.
- `/customers/find-or-create` không override `fullName`/`email` nếu phone đã tồn tại để bảo vệ dữ liệu OPERATOR đã chỉnh.
- `phone` không được sửa qua PATCH; do global ValidationPipe đang `forbidNonWhitelisted=true`, DTO accept `phone` optional nhưng service chủ động ignore để đúng acceptance test.
- OTP chưa implement logic send/verify; chỉ có fields mặc định `false/null`.

### Pending

- [ ] OTP send/verify phase 3.
- [ ] Booking/service history derive từ Booking module sau.
- [ ] Customer loyalty/membership out of scope MVP.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-21_001_Khang](2026-05-21_001_Khang.md) | 2026-05-21 | Khang | Implement Customer CRUD + seed 8 khách hàng |
