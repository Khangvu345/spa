# Module: Service Order

> Tài liệu hiện trạng của module Phiếu dịch vụ, cập nhật khi đóng session có thay đổi code.

---

## Mô tả

Module quản lý Phiếu dịch vụ cho một lần khách đến spa sử dụng một hoặc nhiều dịch vụ. Đây là cầu nối giữa Booking/khách walk-in và Invoice, lưu snapshot dịch vụ/chuyên viên/hoa hồng để Invoice dùng dữ liệu lịch sử ổn định.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** -

---

## Liên kết

- **Mã nguồn:** `src/modules/service-order`
- **API spec:** Swagger tag `Service Orders`
- **Issue gốc:** [#16](../../issues/16.md)
- **Module liên quan:** `customer`, `service`, `staff-service-assignment`, `booking`, `invoice`

---

## Hiện trạng

### Endpoint đã triển khai

| Phương thức | Đường dẫn | Mô tả | Quyền |
|---|---|---|---|
| POST | `/service-orders` | Tạo Phiếu dịch vụ rỗng | `@Roles(OPERATOR, ADMIN)` |
| GET | `/service-orders` | Danh sách, có lọc theo `status`, `customerId`, `fromDate/toDate`, sắp xếp và phân trang | JWT mọi role |
| GET | `/service-orders/:id` | Chi tiết phiếu, customer lite và items snapshot | JWT mọi role |
| PATCH | `/service-orders/:id` | Cập nhật `note`, `extraCharge`, hoặc chuyển `DRAFT -> IN_PROGRESS` | `@Roles(OPERATOR, ADMIN)` |
| POST | `/service-orders/:id/items` | Thêm item dịch vụ, snapshot dịch vụ/chuyên viên/hoa hồng | `@Roles(OPERATOR, ADMIN)` |
| PATCH | `/service-orders/:id/items/:itemId` | Sửa `quantity`, `note`; `serviceId` nếu gửi lên sẽ bị bỏ qua | `@Roles(OPERATOR, ADMIN)` |
| DELETE | `/service-orders/:id/items/:itemId` | Xóa item khỏi phiếu và tính lại tổng | `@Roles(OPERATOR, ADMIN)` |
| POST | `/service-orders/:id/complete` | Chuyển `IN_PROGRESS -> COMPLETED` | `@Roles(OPERATOR, ADMIN)` |
| POST | `/service-orders/:id/cancel` | Hủy phiếu nếu chưa `INVOICED`, lưu lý do hủy | `@Roles(OPERATOR, ADMIN)` |

### Trường dữ liệu chính

- `orderCode: string` - mã duy nhất dạng `SO-YYYYMMDD-NNNN`.
- `customerId: ObjectId` - tham chiếu `Customer`, bắt buộc.
- `items[]` - embedded snapshot dịch vụ/chuyên viên: `serviceId`, `serviceCode`, `serviceName`, `unitPrice`, `quantity`, `subtotal`, `staffId`, `staffName`, `commissionRate`, `note`, `addedAt`.
- `itemsSubtotal`, `extraCharge`, `totalAmount` - tính lại khi item hoặc extraCharge thay đổi.
- `status` - `DRAFT`, `IN_PROGRESS`, `COMPLETED`, `INVOICED`, `CANCELLED`.
- `note`, `createdBy`, `createdByName`, `bookingId`.
- `startedAt`, `completedAt`, `invoicedAt`, `cancelledAt`, `cancelledBy`, `cancelReason`.
- `created_at`, `updated_at` - timestamps.

### Index

- `{ orderCode: 1 }` unique
- `{ customerId: 1 }`
- `{ status: 1 }`
- `{ created_at: -1 }`
- `{ status: 1, created_at: -1 }`
- `{ bookingId: 1 }`

### Quyết định kỹ thuật quan trọng

- Items là embedded sub-document để giữ snapshot giá dịch vụ, chuyên viên và `commissionRate` tại thời điểm thêm vào phiếu.
- Field thường lưu camelCase theo hiện trạng codebase sau log service `2026-05-13_002_Khanh`; collection vẫn là `service_orders`, timestamps vẫn là `created_at`/`updated_at`.
- `orderCode` dùng count theo ngày và retry 3 lần nếu đụng unique key. MVP chấp nhận race condition nhỏ; production nên dùng atomic counter.
- Service Order không tự tạo Invoice. Invoice #19 sẽ inject `ServiceOrderService` và gọi `markAsInvoiced(orderId, invoiceId, session)`.
- `createdByName` lấy từ `EmployeeService.findById(currentUser.id)` vì JWT hiện chỉ chứa `id/email/role`.
- `UpdateItemDto` nhận `serviceId` optional chỉ để tương thích acceptance test trong khi global `ValidationPipe` đang `forbidNonWhitelisted=true`; service không apply field này.
- Sau Booking check-in, Phiếu dịch vụ là chủ vòng đời phục vụ: `DRAFT -> IN_PROGRESS` đồng bộ Booking thành `IN_PROGRESS`, `IN_PROGRESS -> COMPLETED` đồng bộ Booking thành `COMPLETED`, `INVOICED` không đồng bộ tiếp.
- Phiếu dịch vụ walk-in có `bookingId=null`; nhánh đồng bộ Booking sẽ skip có chủ đích.

### Còn lại

- [x] Booking #17 tạo Phiếu dịch vụ khi check-in và đồng bộ vòng đời SO -> Booking.
- [ ] Khi Invoice #19 hoàn tất, verify transaction gọi `markAsInvoiced`.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-21_001_Khang](2026-05-21_001_Khang.md) | 2026-05-21 | Khang | Triển khai CRUD Phiếu dịch vụ, luồng trạng thái, snapshot item và smoke test |
