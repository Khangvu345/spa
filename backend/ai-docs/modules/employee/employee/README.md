# Module: employee/employee

> Living state document - cập nhật khi đóng session có code changes.

---

## Mô tả

CRUD nhân viên trên collection `staff`, dùng Staff schema đã có từ issue #02.
Module này phục vụ admin tạo/cập nhật nhân viên và mọi role đã login xem danh sách/chi tiết theo issue #03.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** ---

---

## Liên kết

- **Code:** `src/modules/employee/employee`
- **API spec:** Swagger `/api-docs`
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

### Schema fields chính

- Dùng lại `Staff` schema trong `staff.schema.ts`, collection `staff`.
- Không sửa schema trong issue #03.
- Field account/password nhạy cảm: `passwordHash` không bao giờ trả response; PATCH employee không apply `email`, `password`, `accountStatus`.

### Quyết định kỹ thuật quan trọng

- `GET /employees` và `GET /employees/:id` không gắn `@Roles`, dùng global JWT guard nên mọi role đã login đều truy cập theo issue.
- RỦI RO còn pending: STAFF xem record của staff khác có thể là horizontal privilege escalation. Cần Vu/Khang chốt nếu muốn restrict STAFF chỉ xem chính mình trong issue riêng hoặc sửa criteria.
- PATCH `/employees/:id` dùng interceptor strip `email/password` trước validation, DTO vẫn omit hai field này và service không apply credential.
- Pagination default riêng cho employee là page 1, limit 10 theo issue #03.

### Pending

- [ ] Chốt policy detail endpoint: STAFF có được xem record người khác không.
- [ ] Issue #04 xử lý reset password, lock/unlock, delete account.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-13_001_Khang](2026-05-13_001_Khang.md) | 2026-05-13 | Khang | Implement Employee CRUD trên Staff schema |
