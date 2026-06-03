# Module: staff-service-assignment

> Living state document - cập nhật khi đóng session có code changes.

---

## Mô tả

Module quản lý mapping chuyên viên spa phụ trách dịch vụ và tỉ lệ hoa hồng theo dịch vụ. Đây là dependency cho Booking/Service Order chọn staff và Invoice snapshot commission rate.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** ---

---

## Liên kết

- **Code:** `src/modules/staff-service-assignment`
- **Seed script:** `src/scripts/seed-staff-service-assignments.ts` (`npm run seed:assignments`)
- **Issue gốc:** [#15](../../issues/15.md)
- **Related modules:** `employee/employee` (Staff), `service`, `booking` future, `invoice` future

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/staff-service-assignments` | List mapping, filter `staffId`, `serviceId`, `isActive`, không pagination | JWT mọi role |
| GET | `/staff-service-assignments/by-service/:serviceId` | Tìm assignment active của 1 service | JWT mọi role |
| GET | `/staff-service-assignments/by-staff/:staffId` | Tìm các assignment active của 1 staff | JWT mọi role |
| POST | `/staff-service-assignments` | Tạo mapping mới | `@Roles(ADMIN)` |
| PATCH | `/staff-service-assignments/:id` | Cập nhật `commissionRate`, `assignedSince`, `note`, `isActive` | `@Roles(ADMIN)` |

> Không có DELETE. Reassign theo context issue #15: PATCH assignment cũ `isActive=false`, sau đó POST assignment mới.

### Schema fields chính (collection `staff_service_assignments`)

- `staffId: ObjectId` ref `Staff`, required
- `serviceId: ObjectId` ref `Service`, required
- `commissionRate: number` integer 0-100, ví dụ 20 = 20%
- `assignedSince: Date`, default now
- `isActive: boolean`, default true
- `note: string`, default ''
- `created_at`, `updated_at` timestamps

### Indexes

- `{ staffId: 1 }`
- `{ serviceId: 1 }`
- `{ isActive: 1 }`
- `{ serviceId: 1, isActive: 1 }` unique partial với `partialFilterExpression: { isActive: true }`

### Seed data

`npm run seed:assignments` tạo 6 mapping active:

| Service | Staff | Commission |
|---|---|---|
| `SWEDISH_60` | Nguyễn Lộc | 20 |
| `HOT_STONE_90` | Trần Khánh | 25 |
| `THAI_90` | Lê Việt | 22 |
| `FOOT_45` | Phạm Minh | 18 |
| `NECK_SHOULDER_30` | Hoàng Công | 15 |
| `AROMA_60` | Đặng Trang | 20 |

### Quyết định kỹ thuật quan trọng

- `staffId` phải là staff role `STAFF`, `workStatus=ACTIVE`, `accountStatus=ACTIVE` khi tạo mapping.
- `serviceId` phải tồn tại và `isActive=true` khi tạo mapping.
- Mỗi service chỉ có 1 assignment active tại một thời điểm, enforce bằng unique partial index.
- PATCH không đổi `staffId`/`serviceId`; reassign dùng deactivate + create để không làm sai báo cáo lịch sử.
- Response populate `staff: { id, fullName, role }` và `service: { id, code, name, price }`.
- Field thường lưu camelCase theo hiện trạng Mongoose của codebase; riêng timestamps dùng `created_at`/`updated_at`.

### Pending

- [ ] Smoke test Postman các endpoint issue #15 với DB dev.
- [ ] Chạy seed theo thứ tự `seed:services` -> `seed:staff` -> `seed:assignments` trên DB dev.
- [ ] Khi làm Invoice #19, snapshot `commissionRate` vào invoice/payroll data, không đọc live mapping cho dữ liệu lịch sử.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-21_001_Khang](2026-05-21_001_Khang.md) | 2026-05-21 | Khang | Triển khai staff_service_assignments issue #15 |
