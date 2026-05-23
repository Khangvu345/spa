# Module: Invoice

> Living state document — cập nhật khi đóng session ⚠️.

---

## Mô tả

Module hóa đơn (Invoice) — tạo từ Service Order COMPLETED, thanh toán CASH, và **Auto Stock Deduction** khi chuyển PAID (trong MongoDB transaction).

---

## Thành viên phụ trách

- **Chính:** Khanh
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/invoice/`
- **API spec:** Swagger `/api-docs` tag `Invoices`
- **Related modules:** `service-order` (markAsInvoiced), `service-material-bom` (findByService), `stock-ledger` (deductForInvoice), `customer`

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/invoices` | Tạo invoice từ Service Order COMPLETED | OPERATOR, ADMIN |
| GET | `/invoices` | Danh sách (filter + pagination + sort) | JWT |
| GET | `/invoices/:id` | Chi tiết | JWT |
| PATCH | `/invoices/:id` | Cập nhật discount/note (chỉ DRAFT) | OPERATOR, ADMIN |
| POST | `/invoices/:id/finalize` | DRAFT → PENDING_PAYMENT | OPERATOR, ADMIN |
| POST | `/invoices/:id/mark-paid` | PENDING_PAYMENT → PAID + auto deduct | OPERATOR, ADMIN |
| POST | `/invoices/:id/cancel` | Hủy invoice (DRAFT/PENDING_PAYMENT) | OPERATOR, ADMIN |

### Schema fields chính

- `invoiceCode: string` — unique, format `INV-YYYYMMDD-NNNN`
- `serviceOrderId: ObjectId` — **unique** (1-1 với Service Order)
- `customerId: ObjectId` + `customerSnapshot { fullName, phone, email }` — snapshot khách
- `items: InvoiceItem[]` — embed snapshot từ Service Order, mỗi item lưu thêm `commissionAmount = round(subtotal * commissionRate / 100)`
- `itemsSubtotal, extraCharge, discountAmount, totalAmount: number`
- `status: 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED'`
- `paymentMethod: 'CASH' | 'VNPAY' | null` (default null; set khi mark-paid; phase 1 chỉ CASH)
- `createdBy/Name, paidAt/By/Name, cancelledAt/By, cancelReason`
- `stockDeducted: boolean` — true sau khi PAID + deduct xong (cờ phục vụ refund tương lai)

### Quyết định kỹ thuật quan trọng

- **1-1 Service Order ↔ Invoice** — `serviceOrderId` unique index. Re-tạo invoice cho SO đã invoiced → 409.
- **Mark Paid wrap MongoDB transaction** — gom thay đổi invoice + service order + ledger entries vào 1 session. Fail bất kỳ bước nào → rollback toàn bộ.
- **Auto Stock Deduction aggregation** — build `Map<materialId, totalDeductQty>` trước khi gọi `stockLedgerService.deductForInvoice` để tránh tạo nhiều ledger entries cho cùng 1 material.
- **Cho phép stock âm khi PAID** — quyết định dự án; không reject, admin kiểm kê sau qua ADJUSTMENT.
- **Commission snapshot tại Invoice creation** — copy từ Service Order item, KHÔNG re-resolve tại PAID. Đổi assignment commissionRate về sau không ảnh hưởng invoice cũ.
- **paymentMethod default null** — chỉ set khi `mark-paid` (DRAFT/PENDING_PAYMENT chưa biết phương thức).
- **Discount validate trong service** — `discountAmount > itemsSubtotal + extraCharge` → 400 `INVOICE_DISCOUNT_EXCEEDS_TOTAL`.

### Pending

- [ ] VNPay integration (phase 4 optional)
- [ ] In PDF hóa đơn (phase 2B)
- [ ] Refund flow (out of scope hiện tại)
- [ ] Trigger Salary calculation từ `commissionAmount` snapshot (phase 2)
- [ ] Acceptance test transaction integrity cần MongoDB replica set local

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-23_001_Khanh](2026-05-23_001_Khanh.md) | 2026-05-23 | Khanh | Scaffold module Invoice: schema + 6 DTO + service (transaction + auto stock deduct) + controller + wire app.module |
