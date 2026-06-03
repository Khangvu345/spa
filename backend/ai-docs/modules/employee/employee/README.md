# Module: employee/employee

> Living state document - cập nhật khi đóng session có code changes.

---

## Mô tả

CRUD nhân viên trên collection `staff`, dùng Staff schema đã có từ issue #02.
Module này phục vụ admin tạo/cập nhật nhân viên, mọi role đã login xem danh sách/chi tiết theo issue #03, và admin quản lý tài khoản nhân viên theo issue #04.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** ---

---

## Liên kết

- **Code:** `src/modules/employee/employee`
- **API spec:** Swagger `/api-docs`
- **Issue role refactor:** [#08](../../../issues/08.md)
- **Related modules:** `auth`

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả |
|---|---|---|
| POST | `/employees` | Admin tạo nhân viên mới với email + password ban đầu |
| GET | `/employees` | Mọi role login xem list với pagination/search/filter/sort |
| GET | `/employees/:id` | Mọi role login xem chi tiết nhân viên |
| PATCH | `/employees/:id` | Admin cập nhật info cho phép, không đổi email/password |
| POST | `/employees/:id/reset-password` | Admin reset mật khẩu nhân viên về default, set `mustChangePassword=true` |
| POST | `/employees/:id/lock` | Admin khóa tài khoản ACTIVE, set `lockedAt=now` |
| POST | `/employees/:id/unlock` | Admin mở khóa tài khoản LOCKED, clear `lockedAt` |
| DELETE | `/employees/:id` | Admin xóa mềm tài khoản đã LOCKED đủ số ngày cấu hình |

### Schema fields chính

- Dùng lại `Staff` schema trong `staff.schema.ts`, collection `staff`.
- Không sửa schema trong issue #03/#04.
- Field account/password nhạy cảm: `passwordHash` không bao giờ trả response; PATCH employee không apply `email`, `password`, `accountStatus`.
- Issue #04 dùng lại `accountStatus`, `lockedAt`, `mustChangePassword` có sẵn trong Staff schema.
- Role hiện còn 3 giá trị: `ADMIN | OPERATOR | STAFF`; `OPERATOR` gộp lễ tân và thu ngân.

### Quyết định kỹ thuật quan trọng

- `GET /employees` và `GET /employees/:id` không gắn `@Roles`, dùng global JWT guard nên mọi role đã login đều truy cập theo issue.
- RỦI RO còn pending: STAFF xem record của staff khác có thể là horizontal privilege escalation. Cần Vu/Khang chốt nếu muốn restrict STAFF chỉ xem chính mình trong issue riêng hoặc sửa criteria.
- PATCH `/employees/:id` dùng interceptor strip `email/password` trước validation, DTO vẫn omit hai field này và service không apply credential.
- Pagination default riêng cho employee là page 1, limit 10 theo issue #03.
- Quản lý tài khoản không tạo module riêng; mở rộng `EmployeeService` với reset mật khẩu, khóa, mở khóa, xóa.
- Admin không được lock/delete chính mình; service trả `CANNOT_OPERATE_SELF`.
- Soft delete không xóa physical record, chỉ set `accountStatus=DELETED` và đổi email sang `original@email.com.deleted.<timestamp>` để giải phóng unique email.
- Delete yêu cầu account đã `LOCKED` và `lockedAt` đủ `ACCOUNT_DELETE_AFTER_LOCK_DAYS` ngày.
- Nếu DB còn dữ liệu cũ `RECEPTIONIST`/`CASHIER`, chạy `npm run migrate:staff-role-operator` để chuyển sang `OPERATOR`.
- Seed nhân viên demo theo 3 role mới chạy bằng `npm run seed:staff`.

### Pending

- [ ] Chốt policy detail endpoint: STAFF có được xem record người khác không.
- [ ] Smoke test thủ công issue #04 với DB dev/Postman.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-17_001_Khang](../../auth/2026-05-17_001_Khang.md) | 2026-05-17 | Khang | Refactor role vận hành về OPERATOR + seed staff demo |
| [2026-05-16_001_Khang](2026-05-16_001_Khang.md) | 2026-05-16 | Khang | Triển khai quản lý tài khoản issue #04 |
| [2026-05-13_001_Khang](2026-05-13_001_Khang.md) | 2026-05-13 | Khang | Triển khai CRUD nhân viên trên Staff schema |
