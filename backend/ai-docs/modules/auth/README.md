# Module: auth

> Living state document — cập nhật khi đóng session ⚠️. AI đọc đây thay vì replay logs.

---

## Mô tả

Module Authentication core cho staff: đăng nhập JWT, lấy profile hiện tại, đổi mật khẩu và RBAC guard nền tảng.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/auth`, `src/modules/employee/employee`
- **API spec:** Swagger `/api-docs`
- **Issue role refactor:** [#08](../../issues/08.md)
- **Related modules:** `employee/employee` chứa Staff schema dùng chung cho Auth + Employee CRUD sau này

---

## Hiện trạng (Current Snapshot)

> Đây là source of truth cho "module hiện trạng". Cập nhật khi đóng session ⚠️.

### Endpoints đã implement

| Method | Path | Mô tả |
|---|---|---|
| POST | `/auth/login` | Staff đăng nhập bằng email/password, public, trả JWT + StaffResponseDto |
| GET | `/auth/me` | Lấy thông tin staff hiện tại từ JWT |
| POST | `/auth/change-password` | Staff tự đổi mật khẩu, xác thực mật khẩu hiện tại, trả JWT mới |

### Schema fields chính

- `Staff.fullName: string` → Mongo `full_name`
- `Staff.phone: string` → SĐT VN 10 chữ số theo DTO/issue sau
- `Staff.email: string` → unique, dùng làm username login
- `Staff.passwordHash: string` → Mongo `password_hash`, không expose qua response
- `Staff.role: StaffRole` → `ADMIN | OPERATOR | STAFF`
- `Staff.baseSalary: number` → Mongo `base_salary`, default 0
- `Staff.workStatus: WorkStatus` → `ACTIVE | ON_LEAVE | RESIGNED`
- `Staff.accountStatus: AccountStatus` → `ACTIVE | LOCKED | DELETED`
- `Staff.startedAt: Date` → Mongo `started_at`
- `Staff.lockedAt: Date | null` → Mongo `locked_at`, không expose qua StaffResponseDto ở issue #02
- `Staff.mustChangePassword: boolean` → Mongo `must_change_password`, FE dùng để redirect đổi mật khẩu

### Quyết định kỹ thuật quan trọng

- Global guard bật ở `AppModule`: JWT mặc định bắt buộc cho toàn app, endpoint public phải dùng `@Public()`.
- Global guard thứ tự hiện tại: `JwtAuthGuard` → `MustChangePasswordGuard` → `RolesGuard`.
- Login chỉ check `account_status === ACTIVE`; không check `work_status`, nên staff `ON_LEAVE` vẫn login được.
- Login chống timing attack bằng dummy bcrypt hash khi email không tồn tại.
- `StaffResponseDto` là tín hiệu duy nhất cho FE về `mustChangePassword`; không tạo endpoint riêng.
- `MustChangePasswordGuard` block mọi endpoint khi token có `mustChangePassword=true`, ngoại trừ endpoint public, `GET /auth/me`, và `POST /auth/change-password`.
- `/auth/change-password` trả `AuthResponseDto` mới sau khi DB set `mustChangePassword=false` để FE thay token cũ còn claim `mustChangePassword=true`.
- Không tạo `POST /auth/logout`; client tự xóa stateless JWT.
- Health endpoint được đánh dấu `@Public()` để vẫn dùng smoke check khi global guard bật.
- DNS config cho MongoDB Atlas SRV được tách vào `config/dns.config.ts` để cả app runtime và `seed-admin` cùng dùng.
- Role vận hành đã gộp lễ tân và thu ngân thành `OPERATOR`; dữ liệu cũ `RECEPTIONIST`/`CASHIER` cần chạy `npm run migrate:staff-role-operator`.
- Seed staff demo theo 3 role mới chạy bằng `npm run seed:staff`.

### Pending

- [x] Postman smoke test đầy đủ các case trong issue #02 với DB dev.
- [ ] Issue #03 implement Employee CRUD, không sửa Staff schema nền.
- [x] Issue #04 triển khai admin reset mật khẩu/khóa/mở khóa, không sửa Staff schema nền.
- [ ] PR riêng update skill thêm section "Action Endpoints Pattern" như issue #02 ghi chú.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-17_001_Khang](2026-05-17_001_Khang.md) | 2026-05-17 | Khang | Refactor role vận hành về OPERATOR + seed staff demo |
| [2026-05-12_001_Khang](2026-05-12_001_Khang.md) | 2026-05-12 | Khang | Triển khai auth core JWT/RBAC và Staff schema |
