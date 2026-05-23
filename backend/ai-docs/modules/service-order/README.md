# Module: service-order

> Living state document - cập nhật khi đóng session có code changes.

---

## Mô tả

Module quản lý phiếu dịch vụ cho một lần khách đến spa sử dụng một hoặc nhiều dịch vụ. Đây là cầu nối giữa Booking/Walk-in và Invoice, lưu snapshot service/staff/commission để Invoice dùng dữ liệu lịch sử ổn định.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** ---

---

## Liên kết

- **Code:** `src/modules/service-order`
- **API spec:** Swagger tag `Service Orders`
- **Issue gốc:** [#16](../../issues/16.md)
- **Related modules:** `customer`, `service`, `staff-service-assignment`, `booking` future, `invoice` future

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/service-orders` | Tạo phiếu dịch vụ rỗng | `@Roles(OPERATOR, ADMIN)` |
| GET | `/service-orders` | Danh sách + filter `status`, `customerId`, `fromDate/toDate`, sort, pagination | JWT mọi role |
| GET | `/service-orders/:id` | Chi tiết phiếu + customer lite + items snapshot | JWT mọi role |
| PATCH | `/service-orders/:id` | Cập nhật `note`, `extraCharge`, hoặc chuyển `DRAFT -> IN_PROGRESS` | `@Roles(OPERATOR, ADMIN)` |
| POST | `/service-orders/:id/items` | Thêm service item, snapshot service/staff/commission | `@Roles(OPERATOR, ADMIN)` |
| PATCH | `/service-orders/:id/items/:itemId` | Sửa `quantity`, `note`; `serviceId` nếu gửi lên sẽ bị ignore | `@Roles(OPERATOR, ADMIN)` |
| DELETE | `/service-orders/:id/items/:itemId` | Xóa item khỏi phiếu và tính lại tổng | `@Roles(OPERATOR, ADMIN)` |
| POST | `/service-orders/:id/complete` | Chuyển `IN_PROGRESS -> COMPLETED` | `@Roles(OPERATOR, ADMIN)` |
| POST | `/service-orders/:id/cancel` | Hủy phiếu nếu chưa `INVOICED`, append reason vào note | `@Roles(OPERATOR, ADMIN)` |

### Schema fields chính (collection `service_orders`)

- `orderCode: string` - unique, format `SO-YYYYMMDD-NNNN`.
- `customerId: ObjectId` - ref `Customer`, required.
- `items[]` - embed snapshot service/staff: `serviceId`, `serviceCode`, `serviceName`, `unitPrice`, `quantity`, `subtotal`, `staffId`, `staffName`, `commissionRate`, `note`, `addedAt`.
- `itemsSubtotal`, `extraCharge`, `totalAmount` - tính lại khi item hoặc extraCharge thay đổi.
- `status: DRAFT | IN_PROGRESS | COMPLETED | INVOICED | CANCELLED`.
- `note`, `createdBy`, `createdByName`, `bookingId`.
- `startedAt`, `completedAt`, `invoicedAt`, `cancelledAt`.
- `created_at`, `updated_at` timestamps.

### Indexes

- `{ orderCode: 1 }` unique
- `{ customerId: 1 }`
- `{ status: 1 }`
- `{ created_at: -1 }`
- `{ status: 1, created_at: -1 }`
- `{ bookingId: 1 }`

### Quyết định kỹ thuật quan trọng

- Items là embedded sub-document để giữ snapshot giá dịch vụ, chuyên viên và `commissionRate` tại thời điểm thêm vào phiếu.
- Field thường lưu camelCase theo hiện trạng codebase sau log service `2026-05-13_002_Khanh`; collection vẫn là `service_orders`, timestamps vẫn `created_at`/`updated_at`.
- `orderCode` dùng count theo ngày + retry 3 lần nếu đụng unique key. MVP chấp nhận race condition nhỏ; production nên dùng atomic counter.
- Service Order không tự tạo Invoice. Invoice #19 sẽ inject `ServiceOrderService` và gọi `markAsInvoiced(orderId, invoiceId, session)`.
- `createdByName` lấy từ `EmployeeService.findById(currentUser.id)` vì JWT hiện chỉ chứa `id/email/role`.
- `UpdateItemDto` nhận `serviceId` optional chỉ để tương thích acceptance test trong khi global `ValidationPipe` đang `forbidNonWhitelisted=true`; service không apply field này.

### Pending

- [ ] Khi Booking #17 hoàn tất, dùng `bookingId` để tạo phiếu khi check-in.
- [ ] Khi Invoice #19 hoàn tất, verify transaction gọi `markAsInvoiced`.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-21_001_Khang](2026-05-21_001_Khang.md) | 2026-05-21 | Khang | Triển khai Service Order CRUD + status flow + snapshot items, đã smoke test |
