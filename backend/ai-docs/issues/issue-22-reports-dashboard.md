---
id: 22
title: Module Reports & Dashboard — Thống kê doanh thu/booking/nhân viên + Export Excel
module: reports
paste_date: 2026-05-24
pasted_by: Vu
status: in-progress
---

# Issue #22: Module Reports & Dashboard + Export Excel

> Snapshot của issue tại thời điểm dev paste vào chat AI.

---

## Nội dung Issue (paste nguyên văn)

## Mô tả

Implement module **Reports & Dashboard** — các endpoint aggregate phục vụ:
1. Dashboard tổng quan (doanh thu, booking, dịch vụ hoàn thành, tồn kho thấp)
2. Báo cáo doanh thu theo khoảng thời gian, lọc theo dịch vụ
3. Thống kê booking + dịch vụ hoàn thành theo dịch vụ và theo nhân viên
4. Export báo cáo ra file Excel

**Đây là mảnh PDF lớn cuối cùng của BE.** PDF yêu cầu đích danh (mục Quản trị viên):
- "Xem dashboard tổng quan về doanh thu, booking, dịch vụ hoàn thành và tồn kho"
- "Xem báo cáo doanh thu theo khoảng thời gian, lọc theo dịch vụ"
- "Thống kê số lượng booking, dịch vụ hoàn thành theo dịch vụ và theo nhân viên"
- "Xuất báo cáo ra file Excel hoặc PDF"

**Bản chất:** giống Payroll #21 — KHÔNG tính toán mới, chỉ **aggregate** dữ liệu đã có (`invoices`, `bookings`, `service_orders`, `materials`). Là bài toán gom + nhóm + đếm, không phải logic nghiệp vụ mới.

**Phạm vi giới hạn:**
- ✅ Dashboard overview (số tổng hợp + vài con số chính)
- ✅ Báo cáo doanh thu theo kỳ + lọc theo dịch vụ
- ✅ Thống kê theo dịch vụ (số lượt, doanh thu)
- ✅ Thống kê theo nhân viên (số ca, doanh thu mang lại, hoa hồng)
- ✅ Export Excel (dùng `exceljs`)
- ⏸️ Export PDF — làm SAU Excel, chỉ nếu còn thời gian (Excel ưu tiên vì rẻ hơn nhiều)
- ❌ KHÔNG có biểu đồ ở BE — BE trả số liệu thô, FE tự vẽ chart
- ❌ KHÔNG real-time/WebSocket — FE gọi REST khi load trang
- ❌ KHÔNG cache layer — query trực tiếp (data nhỏ, MVP đủ nhanh)
- ❌ KHÔNG so sánh kỳ trước (growth %) — out of scope MVP

## Nghiệp vụ (User stories)

- **RP-01 Dashboard:** ADMIN mở dashboard → thấy doanh thu kỳ này, số booking, số dịch vụ hoàn thành, số vật liệu sắp hết — trong 1 lần gọi
- **RP-02 Báo cáo doanh thu:** ADMIN chọn từ ngày–đến ngày → tổng doanh thu + breakdown theo dịch vụ (sắp xếp doanh thu giảm dần)
- **RP-03 Lọc theo dịch vụ:** Báo cáo doanh thu của riêng 1 dịch vụ trong kỳ
- **RP-04 Thống kê dịch vụ:** Mỗi dịch vụ: số lượt phục vụ, tổng doanh thu trong kỳ
- **RP-05 Thống kê nhân viên:** Mỗi chuyên viên: số ca phục vụ, doanh thu mang lại, tổng hoa hồng trong kỳ
- **RP-06 Chi tiết hóa đơn theo dịch vụ:** Click 1 dịch vụ → list các invoice có dịch vụ đó (mã HĐ, tên khách, ngày, tiền) — khớp "Ý tưởng sơ khai" module 5
- **RP-07 Export Excel:** ADMIN xuất báo cáo doanh thu kỳ đang xem ra file .xlsx

## API Endpoints

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/dashboard/overview` | Số liệu tổng quan (1 call cho cả dashboard) | `@Roles('ADMIN')` |
| GET | `/reports/revenue` | Báo cáo doanh thu theo kỳ (+ filter serviceId) | `@Roles('ADMIN')` |
| GET | `/reports/by-service` | Thống kê theo dịch vụ (số lượt + doanh thu) | `@Roles('ADMIN')` |
| GET | `/reports/by-staff` | Thống kê theo nhân viên (số ca + doanh thu + hoa hồng) | `@Roles('ADMIN')` |
| GET | `/reports/service-invoices` | Chi tiết invoice của 1 dịch vụ trong kỳ (RP-06) | `@Roles('ADMIN')` |
| GET | `/reports/revenue/export` | Export báo cáo doanh thu ra Excel | `@Roles('ADMIN')` |

> Tất cả `@Roles('ADMIN')` — báo cáo là quyền quản trị.
> Mốc thời gian: **lọc theo `paidAt`** (doanh thu = thực thu), KHÔNG phải `created_at`. Khớp quyết định Payroll #21.

## Acceptance Criteria

### A. KHÔNG có schema mới

Module này **không tạo collection mới** — chỉ đọc + aggregate từ collection có sẵn. Không có `@Schema`, không có index mới (tận dụng index đã có ở #20: `(status, created_at)`, `paidAt: -1`).

### B. Field Reference — ĐỌC TRƯỚC KHI VIẾT PIPELINE (chống lẫn biến)

> Giống bài học #21. Báo cáo gom từ nhiều collection, dễ lẫn field cùng tên giữa các tầng. Gõ theo bảng, KHÔNG tự nhớ.

**Nguồn dữ liệu cho từng báo cáo:**

| Báo cáo | Collection nguồn | Lọc theo | Gom theo |
|---|---|---|---|
| Doanh thu | `invoices` (status=PAID) | `invoice.paidAt` | toàn kỳ / `items.serviceId` |
| Theo dịch vụ | `invoices` (status=PAID) → unwind items | `invoice.paidAt` | `items.serviceId` |
| Theo nhân viên | `invoices` (status=PAID) → unwind items | `invoice.paidAt` | `items.staffId` |
| Số booking | `bookings` | `booking.scheduledAt` (hoặc field ngày hẹn thật) | toàn kỳ / `status` |
| Dịch vụ hoàn thành | `service_orders` (status=COMPLETED/INVOICED) | ngày complete | `serviceId` |
| Tồn kho thấp | `materials` | `stockQuantity <= reorderLevel` | — |

**Bảng "dùng cái này — KHÔNG nhầm cái kia" (invoice — nguồn chính):**

| Mục đích | DÙNG | KHÔNG nhầm sang |
|---|---|---|
| Lọc đã thanh toán | `invoice.status = 'PAID'` (cấp ngoài) | — |
| Lọc theo kỳ | `invoice.paidAt` (cấp ngoài) | `created_at`, `cancelledAt` |
| Doanh thu thực tế | `invoice.totalAmount` (cấp ngoài, đã trừ giảm giá) | `itemsSubtotal` (chưa trừ discount) |
| Doanh thu theo dịch vụ | `items.subtotal` (sau unwind) | `items.unitPrice`, `items.commissionAmount` |
| Số lượt dịch vụ | `items.quantity` | — |
| Chuyên viên phục vụ | `items.staffId` (sau unwind) | `invoice.createdBy`, `invoice.paidBy` (thu ngân — KHÔNG phải chuyên viên) |
| Hoa hồng nhân viên | `items.commissionAmount` | `items.subtotal` |

**3 lỗi IM LẶNG nguy hiểm nhất:**
1. Lọc `created_at` thay vì `paidAt` → doanh thu sai kỳ, vẫn ra số → khó phát hiện.
2. Dùng `itemsSubtotal` thay vì `totalAmount` cho doanh thu tổng → sai khi có giảm giá (báo cáo cao hơn thực thu).
3. Gom theo `invoice.createdBy` (thu ngân) thay vì `items.staffId` (chuyên viên) ở báo cáo nhân viên → quy doanh thu/hoa hồng cho nhầm người.

> ⚠️ **Verify tên field THẬT bằng `db.invoices.findOne()` trước khi viết `$match`** — schema map `paidAt` qua `@Prop` nhưng `created_at` để snake_case. Đây là nguồn lỗi "pipeline trả rỗng" số 1.
>
> ⚠️ **Booking date field:** xác nhận tên field ngày hẹn thật trong `booking.schema.ts` (`scheduledAt`? `bookingTime`?) trước khi lọc. Nếu chưa rõ → `db.bookings.findOne()`.

### C. DTOs (query params)

- [ ] `DateRangeQueryDto` (base — dùng chung):
  - `fromDate` (IsDateString, required) — đầu kỳ
  - `toDate` (IsDateString, required) — cuối kỳ
  - Validate: `fromDate <= toDate` → nếu sai 400 VALIDATION_FAILED
  - Helper: convert sang khoảng `[fromDate 00:00, toDate+1 00:00)` để lọc trọn ngày cuối

- [ ] `RevenueReportQueryDto` extends `DateRangeQueryDto`:
  - `serviceId?` (IsMongoId, optional) — lọc 1 dịch vụ (RP-03)

- [ ] `ServiceInvoicesQueryDto` extends `DateRangeQueryDto`:
  - `serviceId` (IsMongoId, required)
  - `page`, `limit` (pagination — list invoice có thể dài)

### D. ReportsService — Aggregation logic

- [ ] `getDashboardOverview(): Promise<DashboardOverviewDto>`
  - Mặc định kỳ = **tháng hiện tại** (từ đầu tháng đến giờ)
  - Trả gộp trong 1 object:
    ```
    {
      revenue: { thisMonth, today },        // sum totalAmount invoice PAID
      bookings: { total, byStatus: {...} }, // đếm booking trong tháng theo status
      servicesCompleted: number,            // số service_order COMPLETED+INVOICED tháng này
      lowStockCount: number,                // số material <= reorderLevel
      topServices: [...]                    // top 5 dịch vụ doanh thu cao (gọi lại by-service, limit 5)
    }
    ```
  - ⚠️ Gọi song song bằng `Promise.all` các sub-aggregate để nhanh.

- [ ] `getRevenueReport(query): Promise<RevenueReportDto>`
  - Pipeline trên `invoices`:
    ```
    1. $match: status='PAID' AND paidAt trong [from, to)
       (+ nếu có serviceId: $match thêm items.serviceId — nhưng phải unwind trước, xem dưới)
    2. Tổng kỳ:
       - totalRevenue = $sum totalAmount
       - invoiceCount = $count
    3. Breakdown theo dịch vụ (nếu KHÔNG filter serviceId):
       - $unwind items
       - $group theo items.serviceId:
         - serviceName: $first
         - count: $sum items.quantity
         - revenue: $sum items.subtotal
       - $sort revenue DESC
    ```
  - ⚠️ Nếu filter `serviceId`: phải $unwind TRƯỚC rồi mới $match items.serviceId (vì serviceId nằm trong mảng items).
  - ⚠️ `totalRevenue` lấy `totalAmount` cấp invoice (đã trừ discount), nhưng breakdown theo dịch vụ dùng `items.subtotal` (chưa trừ discount) → ghi rõ chú thích trong response để FE/người đọc không thắc mắc lệch (tổng breakdown có thể > totalRevenue do discount toàn đơn). Hoặc note "doanh thu dịch vụ chưa phân bổ giảm giá".

- [ ] `getByService(query): Promise<ServiceStatsDto[]>`
  - $match PAID + kỳ → $unwind items → $group theo serviceId → count(quantity) + sum(subtotal) → sort DESC
  - Mỗi dòng: `{ serviceId, serviceName, totalCount, totalRevenue }`

- [ ] `getByStaff(query): Promise<StaffStatsDto[]>`
  - $match PAID + kỳ → $unwind items → $group theo `items.staffId`:
    - staffName: $first
    - serviceCount: $sum items.quantity
    - revenueGenerated: $sum items.subtotal
    - totalCommission: $sum items.commissionAmount
  - $sort revenueGenerated DESC
  - ⚠️ Gom theo `items.staffId` (chuyên viên), KHÔNG phải createdBy/paidBy.

- [ ] `getServiceInvoices(query): Promise<paginated>`  (RP-06)
  - $match PAID + kỳ → $unwind items → $match items.serviceId = query.serviceId
  - $project: invoiceCode, customerSnapshot.fullName, paidAt, items.subtotal
  - Pagination
  - Dùng cho FE: click 1 dịch vụ trong báo cáo → xem các hóa đơn cụ thể

- [ ] `exportRevenueExcel(query): Promise<Buffer>`  (RP-07)
  - Gọi `getRevenueReport` + `getByService` để lấy data
  - Dùng `exceljs` tạo workbook:
    - Sheet 1 "Tổng quan": kỳ báo cáo, tổng doanh thu, số hóa đơn
    - Sheet 2 "Theo dịch vụ": bảng serviceName | số lượt | doanh thu
    - Header in đậm, format số tiền có phân cách nghìn
  - Trả Buffer → controller set header `Content-Type` + `Content-Disposition: attachment`

### E. ReportsController

- [ ] `GET /dashboard/overview` `@Roles('ADMIN')`
- [ ] `GET /reports/revenue` `@Roles('ADMIN')`
- [ ] `GET /reports/by-service` `@Roles('ADMIN')`
- [ ] `GET /reports/by-staff` `@Roles('ADMIN')`
- [ ] `GET /reports/service-invoices` `@Roles('ADMIN')`
- [ ] `GET /reports/revenue/export` `@Roles('ADMIN')`:
  - Set response header:
    ```typescript
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bao-cao-doanh-thu-${from}-${to}.xlsx"`);
    res.send(buffer);
    ```
  - ⚠️ Endpoint này trả file binary, KHÔNG wrap trong ApiResponse envelope. Cần `@Res()` raw response. Ghi chú cho FE: gọi bằng `responseType: 'blob'`, KHÔNG parse JSON.

### F. Module Dependencies

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },        // doanh thu, dịch vụ, nhân viên
      { name: Booking.name, schema: BookingSchema },         // đếm booking
      { name: ServiceOrder.name, schema: ServiceOrderSchema },// dịch vụ hoàn thành
      { name: Material.name, schema: MaterialSchema },       // low stock count
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
```
> Inject Model trực tiếp (chỉ đọc aggregate), KHÔNG cần inject service của module khác. Tránh coupling.
> `exceljs`: `npm install exceljs` (thêm vào backend package.json).

### G. Error Codes

Không cần code mới — dùng `VALIDATION_FAILED` (sai khoảng ngày), `FORBIDDEN` (non-admin), `SERVICE_NOT_FOUND` (nếu serviceId filter không tồn tại — optional check).

## Testing — Acceptance Test Cases

**Dashboard:**
- [ ] GET /dashboard/overview → trả đủ revenue/bookings/servicesCompleted/lowStockCount/topServices
- [ ] Tháng không có giao dịch → các số = 0, mảng rỗng (không lỗi)
- [ ] topServices đúng top 5 theo doanh thu giảm dần

**Revenue:**
- [ ] GET /reports/revenue kỳ có 3 invoice PAID → totalRevenue = sum totalAmount đúng
- [ ] Invoice DRAFT/PENDING/CANCELLED trong kỳ → KHÔNG tính
- [ ] Invoice PAID paidAt ngoài kỳ → KHÔNG tính
- [ ] breakdown theo dịch vụ sort doanh thu giảm dần
- [ ] filter serviceId → chỉ doanh thu dịch vụ đó
- [ ] fromDate > toDate → 400 VALIDATION_FAILED
- [ ] toDate lấy trọn ngày (invoice paidAt 23:59 ngày cuối vẫn tính)

**By-service / By-staff:**
- [ ] by-service: mỗi dịch vụ count + revenue đúng, sort DESC
- [ ] by-staff: gom theo items.staffId, không lẫn createdBy
- [ ] by-staff: totalCommission = sum commissionAmount đúng (khớp với Payroll #21 cùng kỳ)
- [ ] Invoice nhiều chuyên viên → tách đúng từng staff

**Service-invoices (RP-06):**
- [ ] GET service-invoices serviceId=X → list invoice có dịch vụ X, có pagination
- [ ] Mỗi dòng: invoiceCode, tên khách, ngày, tiền

**Export Excel:**
- [ ] GET /reports/revenue/export → trả file .xlsx tải được, mở bằng Excel OK
- [ ] File có 2 sheet (tổng quan + theo dịch vụ), số liệu khớp endpoint /reports/revenue
- [ ] Response KHÔNG bị wrap JSON envelope (raw binary)
- [ ] Header Content-Disposition có filename đúng kỳ

**Consistency với Payroll:**
- [ ] /reports/by-staff totalCommission của staff X kỳ tháng 5 == Payroll #21 totalCommission của X tháng 5 (cùng nguồn invoice items, phải bằng nhau)

**Authorization:**
- [ ] Mọi endpoint từ non-ADMIN → 403

## Out of scope

- ❌ Export PDF — làm sau Excel, chỉ nếu dư thời gian (phase 2B). Excel đủ đáp ứng "Excel HOẶC PDF" trong PDF.
- ❌ Biểu đồ render ở BE — BE trả số, FE vẽ
- ❌ So sánh kỳ trước, growth %, trend line — out of scope MVP
- ❌ Cache/materialized view — query trực tiếp
- ❌ Báo cáo tồn kho nhập-xuất chi tiết — đã có /stock/summary ở #19, không lặp lại
- ❌ Lịch hẹn theo nhân viên dạng calendar — out of scope (FE tự làm nếu muốn từ /bookings)
- ❌ Export lịch lương — Payroll #21 lo phần payroll, report này chỉ doanh thu

## Dependencies

- Blocked by: **#20** (Invoice — nguồn doanh thu chính), **#17** (Booking — đếm booking), **#16** (Service Order — dịch vụ hoàn thành), **#07** (Material — low stock)
- Tham chiếu chéo: **#21 Payroll** dùng cùng nguồn `invoice.items.commissionAmount` → by-staff phải cho cùng số commission
- Blocks: FE Dashboard + FE màn Báo cáo

## Estimate

6-8h code + test (nhiều endpoint nhưng cùng pattern aggregate; export Excel thêm ~2h)

---

## Context bổ sung từ dev

**Quyết định kỹ thuật đã chốt:**

1. **Mốc thời gian = `paidAt`** — nhất quán với Payroll #21. Doanh thu ghi nhận khi thực thu, không phải khi tạo hóa đơn. Tận dụng index `paidAt: -1` có sẵn.

2. **Doanh thu tổng = `totalAmount` (đã trừ discount), doanh thu theo dịch vụ = `items.subtotal` (chưa trừ discount)** — đây là điểm có thể gây "tổng breakdown ≠ tổng doanh thu" khi có giảm giá toàn đơn. CHẤP NHẬN cho MVP, ghi chú rõ trong response. KHÔNG cố phân bổ discount xuống từng item (phức tạp, out of scope).

3. **KHÔNG schema mới, KHÔNG tính toán mới** — module thuần đọc + aggregate. Giống Payroll: gom số đã có, không sinh logic nghiệp vụ.

4. **Export Excel ưu tiên hơn PDF** — PDF yêu cầu "Excel HOẶC PDF", chọn Excel vì `exceljs` rẻ và đủ. PDF để Tier bonus.

5. **by-staff phải khớp Payroll #21** — cùng đọc `items.commissionAmount` cùng kỳ → con số commission của 1 nhân viên ở 2 nơi PHẢI bằng nhau. Đây là cross-check tốt: nếu lệch → 1 trong 2 pipeline sai. Dùng test case này để verify cả hai.

6. **Dashboard 1-call** — gom mọi số dashboard trong 1 endpoint (`Promise.all` các sub-query) thay vì FE gọi 5 lần. Giảm round-trip, dashboard load nhanh, demo mượt.

7. **Export trả raw binary** — endpoint duy nhất KHÔNG theo ApiResponse envelope. Cần `@Res()`. Đã ghi chú cho FE gọi bằng blob.

8. **Field date của booking cần verify** — chưa chắc tên field ngày hẹn (`scheduledAt`?). Dev MỞ `booking.schema.ts` hoặc `db.bookings.findOne()` xác nhận trước khi viết phần đếm booking. Đừng đoán.

9. **Folder structure:** `src/modules/reports/` (flat). Dashboard + reports gộp 1 module vì cùng bản chất aggregate.

10. **Lưu ý cho FE:**
    - Dashboard: gọi 1 lần `/dashboard/overview`, nhận object đủ số → vẽ card + chart. topServices dựng bar chart.
    - Báo cáo: chọn date range → `/reports/revenue` → bảng + chart. Click 1 dòng dịch vụ → `/reports/service-invoices` xem chi tiết hóa đơn (RP-06).
    - Export: nút "Xuất Excel" → gọi `/reports/revenue/export` với `responseType: 'blob'` → tạo link download. KHÔNG parse JSON.

---

## Logs liên quan

<!-- Tự động cập nhật khi tạo log mới (Workflow B bước 5) -->

- [2026-05-30_001_Khanh](../modules/reports/2026-05-30_001_Khanh.md) — Scaffold module Reports & Dashboard (6 endpoints aggregate + export Excel), wire app.module, cài exceljs. ⚠️ code changes.

---

## Trạng thái

- `in-progress` — đang code
- `done` — đã merge, hoàn thành
- `cancelled` — bỏ, không làm nữa
