## Mô tả

Module quản lý **dịch vụ spa** (massage, các loại trị liệu). Là collection trung tâm sẽ được tham chiếu bởi bookings, service_materials (BOM), commission_configs, staff_services, invoices.

---

## Thành viên phụ trách

- **Chính:** Khanh
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `backend/src/modules/service/`
- **Seed script:** `backend/src/scripts/seed-services.ts` (`npm run seed:services`)
- **Issue gốc:** [#05](../../issues/05.md)
- **Related modules:** auth (Roles/Public decorators), inventory/material (BOM tương lai), booking (slot timing tương lai)

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/services` | Tạo dịch vụ mới | `@Roles(ADMIN)` |
| GET | `/services` | Danh sách + search + filter + sort + pagination | `@Public()` |
| GET | `/services/:id` | Chi tiết dịch vụ | `@Public()` |
| PATCH | `/services/:id` | Cập nhật / toggle isActive | `@Roles(ADMIN)` |

> Không có DELETE — soft delete qua `PATCH { isActive: false }`.

### Schema fields chính (collection `services`)

- `code: string` (UK, regex `/^[A-Z0-9_]+$/`, 3-30 ký tự)
- `name: string` (2-100)
- `category: ServiceCategory` enum — SWEDISH | HOT_STONE | THAI | FOOT | NECK_SHOULDER | AROMA
- `unitPrice: number` (VND, min 0) — DB `unit_price`
- `durationMinutes: number` (1-480) — DB `duration_minutes`
- `bufferMinutes: number` (0-120, default 15) — DB `buffer_minutes` — quan trọng cho Slot Availability (Booking module sẽ dùng)
- `slotsRequired: number` (1-10, default 1) — DB `slots_required`
- `description: string` (max 1000, default '')
- `imageUrl?: string | null` — DB `image_url`
- `isActive: boolean` (default true) — DB `is_active`
- `created_at`, `updated_at` (timestamps)

### Indexes

- `{ code: 1 }` unique
- `{ category: 1 }`
- `{ is_active: 1 }`
- `{ unit_price: 1 }`
- `{ is_active: 1, category: 1 }` (compound)

### Seed data

6 dịch vụ massage mặc định (Issue #05): SWEDISH_60, HOT_STONE_90, THAI_90, FOOT_45, NECK_SHOULDER_30, AROMA_60. Seed idempotent qua `findOneAndUpdate` + `upsert` theo `code`.

### Quyết định kỹ thuật quan trọng

- **Schema fields tuân thủ ERD.md** (category, unitPrice, bufferMinutes, slotsRequired, imageUrl) — không cắt theo bản Issue #05 gốc (vốn chỉ có price/cleanupMinutes), vì đây là collection trung tâm; cắt ngắn sẽ phải migration sau.
- **`ServiceCategory` enum theo seed Issue #05** — gồm 6 loại massage (SWEDISH, HOT_STONE, THAI, FOOT, NECK_SHOULDER, AROMA). Khi cần mở rộng (skincare, nail...) bổ sung thêm enum.
- **Không expose DELETE endpoint** — dùng `isActive=false` để soft delete, giữ data lịch sử cho báo cáo doanh thu, BOM tham chiếu, invoice snapshot.
- **GET endpoints `@Public()`** — landing page khách hàng xem được không cần JWT.
- **Default filter cho list:** nếu client không truyền `isActive`, mặc định `true` (chỉ trả service đang hoạt động). Khi truyền explicit `isActive=false` thì respect.
- **Search:** chỉ regex theo `name` (case-insensitive) như Issue #05 yêu cầu. Code không search vì admin biết code chính xác.

### Pending

- [ ] BOM (`service_materials`) — Issue #07 Material xong mới làm
- [ ] Staff assignment (`staff_services`) — Issue riêng
- [ ] Image upload thực sự (hiện chỉ lưu URL) — out of scope MVP
- [ ] Public list optionally chặn `isActive=false` từ phía non-admin (Issue #05 ghi chú: cân nhắc thêm sau khi discuss với team)
- [ ] Verify Postman 20 test cases (Issue #05 G + service.md §13)

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-13_001_Khanh](2026-05-13_001_Khanh.md) | 2026-05-13 | Khanh | Scaffold module Service: schema (ERD-compliant), 4 DTO, service+controller, seed 6 dịch vụ |
