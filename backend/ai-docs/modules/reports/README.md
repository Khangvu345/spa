# Module: Reports & Dashboard

> Living state document — cập nhật khi đóng session ⚠️.

---

## Mô tả

Module báo cáo & dashboard (#22) — **thuần đọc + aggregate**: gom doanh thu / booking / dịch vụ hoàn thành / tồn kho thấp từ collection có sẵn (`invoices`, `bookings`, `service_orders`, `materials`) + export Excel. KHÔNG schema mới, KHÔNG tính toán nghiệp vụ mới. Bản chất giống Payroll #21: gom + nhóm + đếm.

---

## Thành viên phụ trách

- **Chính:** Khanh
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/reports/`
- **API spec:** Swagger `/api-docs` tag `Reports & Dashboard`
- **Related modules:** `invoice` (doanh thu/dịch vụ/nhân viên theo `paidAt`), `booking` (đếm theo `scheduledStart`), `service-order` (hoàn thành theo `completedAt`), `material` (low stock). Cross-check `payroll` (#21) cùng nguồn `items.commissionAmount`.

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/dashboard/overview` | Số liệu tổng quan (1 call) — RP-01 | ADMIN |
| GET | `/reports/revenue` | Báo cáo doanh thu theo kỳ (+ filter `serviceId`) — RP-02/RP-03 | ADMIN |
| GET | `/reports/by-service` | Thống kê theo dịch vụ (số lượt + doanh thu) — RP-04 | ADMIN |
| GET | `/reports/by-staff` | Thống kê theo nhân viên (số ca + doanh thu + hoa hồng) — RP-05 | ADMIN |
| GET | `/reports/service-invoices` | Chi tiết hóa đơn của 1 dịch vụ trong kỳ (pagination) — RP-06 | ADMIN |
| GET | `/reports/revenue/export` | Export báo cáo doanh thu ra Excel (.xlsx) — RP-07 | ADMIN |

> Tất cả prefix global `/api/v1`. 1 controller (`ReportsController`) dùng path đầy đủ.
> Query thời gian: `fromDate`/`toDate` (YYYY-MM-DD) → service convert `[from 00:00, to+1 00:00)`.

### Nguồn dữ liệu & field (đã verify schema)

- **Doanh thu / theo dịch vụ / theo nhân viên:** `invoices`, `status=PAID`, lọc `paidAt`. Tổng = `totalAmount`. Theo dịch vụ/NV: `$unwind items` → `items.subtotal`, `items.commissionAmount`, gom theo `items.serviceId` / `items.staffId`.
- **Booking:** đếm theo `scheduledStart` (KHÔNG phải `scheduledAt`), group `status`.
- **Dịch vụ hoàn thành:** `service_orders` status ∈ {COMPLETED, INVOICED}, lọc `completedAt`.
- **Tồn kho thấp:** `materials` `isActive=true` AND `stockQuantity <= reorderLevel` (`$expr`).

### Indexes

- KHÔNG tạo index mới — tận dụng index có sẵn: `invoices.paidAt: -1`, `invoices.status`, `bookings.scheduledStart`, `service_orders.status`.

### Quyết định kỹ thuật quan trọng

- **Mốc thời gian = `invoice.paidAt`, status=PAID** — nhất quán Payroll #21 (doanh thu ghi nhận khi thực thu).
- **totalRevenue = `totalAmount` (đã trừ discount); doanh thu theo dịch vụ = `items.subtotal` (chưa trừ discount)** — chấp nhận lệch khi giảm giá toàn đơn, ghi chú rõ trong response (`REVENUE_BREAKDOWN_NOTE`). KHÔNG phân bổ discount xuống item.
- **RP-03 lọc 1 dịch vụ:** `totalRevenue` = Σ`items.subtotal` của riêng dịch vụ đó (KHÔNG cộng `totalAmount` toàn đơn); `invoiceCount` = số invoice distinct chứa dịch vụ; breakdown = 1 dòng.
- **by-staff gom `items.staffId`** (chuyên viên), KHÔNG `createdBy`/`paidBy`. `totalCommission` cùng nguồn Payroll #21 → cross-check bằng nhau cùng kỳ.
- **Dashboard 1-call** — `Promise.all` 6 sub-aggregate, giảm round-trip.
- **`$match status=PAID + paidAt` đứng TRƯỚC `$unwind`** — lọc bớt doc trước khi nở items.
- **Export `@Res()` raw** — endpoint duy nhất KHÔNG qua ResponseInterceptor (trả binary). FE gọi `responseType: 'blob'`, KHÔNG parse JSON.
- **Inject Model trực tiếp** (Invoice/Booking/ServiceOrder/Material) — KHÔNG inject service module khác, tránh coupling.
- **`resolveDateRange`** dựng mốc local từ `YYYY-MM-DD` (tránh lệch UTC), validate `fromDate <= toDate` → 400 `VALIDATION_FAILED`.

### Lưu ý cho FE

- Dashboard: gọi 1 lần `/dashboard/overview`, nhận object đủ số (revenue/bookings/servicesCompleted/lowStockCount/topServices) → vẽ card + chart.
- Báo cáo: chọn date range → `/reports/revenue` (bảng + chart). Click 1 dịch vụ → `/reports/service-invoices` (chi tiết hóa đơn, RP-06).
- Export: nút "Xuất Excel" → `/reports/revenue/export` với `responseType: 'blob'` → tạo link download. KHÔNG parse JSON.

### Pending

- [ ] Acceptance test (dashboard / revenue / by-service / by-staff / service-invoices / export / authorization) — repo chưa có hạ tầng test (`.spec.ts` = 0). Verify thủ công qua Swagger + seed.
- [ ] Cross-check `/reports/by-staff` totalCommission == Payroll #21 cùng kỳ.
- [ ] Export PDF (phase 2B, chỉ nếu dư thời gian).

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-30_001_Khanh](2026-05-30_001_Khanh.md) | 2026-05-30 | Khanh | Scaffold module Reports & Dashboard: 3 query DTO + response DTO + service (6 aggregate + export Excel) + controller (6 endpoints) + wire app.module; cài exceljs |
