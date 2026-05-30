# Module: Payroll

> Living state document — cập nhật khi đóng session ⚠️.

---

## Mô tả

Module phiếu lương (Payroll) — chốt lương hàng tháng cho từng nhân viên: **aggregate** hoa hồng đã snapshot trong invoice PAID (`items[].commissionAmount`, #20) + lương cơ bản → tạo snapshot bất biến `payroll_records`. Bài toán GOM dữ liệu, KHÔNG tính lại tài chính.

---

## Thành viên phụ trách

- **Chính:** Khanh
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/payroll/`
- **API spec:** Swagger `/api-docs` tag `Payrolls`
- **Related modules:** `invoice` (aggregate `items[].commissionAmount` theo `paidAt`), `employee` (lookup `baseSalary`, snapshot role/fullName)

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/payrolls/finalize` | Chốt lương 1 nhân viên cho 1 tháng | ADMIN |
| POST | `/payrolls/finalize-batch` | Chốt lương hàng loạt cho 1 tháng | ADMIN |
| GET | `/payrolls` | Danh sách (filter tháng/staff/status + pagination + sort) | ADMIN |
| GET | `/payrolls/me` | Phiếu lương của chính mình | JWT (mọi role) |
| GET | `/payrolls/preview` | Xem trước (tính live, KHÔNG lưu) cho 1 staff + tháng | ADMIN |
| GET | `/payrolls/:id` | Chi tiết — ADMIN xem mọi phiếu, STAFF chỉ phiếu của mình | JWT + ownership |
| POST | `/payrolls/:id/mark-paid` | Đánh dấu đã chi: FINALIZED → PAID | ADMIN |
| POST | `/payrolls/:id/cancel` | Hủy phiếu (chỉ khi chưa PAID) | ADMIN |

> ⚠️ Thứ tự khai báo route trong controller: `me` và `preview` đứng TRƯỚC `:id` để không bị param `:id` nuốt.

### Schema fields chính (collection `payroll_records`)

- `payrollCode: string` — unique, format `PAY-YYYYMM-NNNN`
- `periodYear, periodMonth: number` — kỳ lương (month 1-12)
- `staffId: ObjectId` + `staffSnapshot { fullName, role }` — snapshot, không reference live
- `baseSalary: number` — copy từ `staff.baseSalary` tại thời điểm chốt
- `totalCommission: number` — Σ `commissionAmount` từ invoice PAID trong tháng
- `adjustment: number` — phụ cấp/phạt thủ công, cho phép âm/dương, default 0
- `totalIncome: number` — = `baseSalary + totalCommission + adjustment`
- `commissionBreakdown: [{ serviceId, serviceName, serviceCount, totalCommission }]` — gom theo service (cho bảng "chi tiết hoa hồng theo dịch vụ" của PDF)
- `sourceInvoiceIds: ObjectId[]` + `invoiceCount: number` — audit truy vết ngược về invoice
- `status: 'FINALIZED' | 'PAID' | 'CANCELLED'`
- `finalizedBy/Name, finalizedAt`, `paidAt/By`, `cancelledAt/By/cancelReason`, `note`

### Indexes

- `payrollCode` (unique)
- Compound partial unique `(staffId, periodYear, periodMonth)` WHERE `status ∈ {FINALIZED, PAID}` — mỗi NV chỉ 1 phiếu active/tháng; phiếu CANCELLED không tính
- `(periodYear, periodMonth)`, `staffId`, `status`

### Quyết định kỹ thuật quan trọng

- **Mốc thời gian = `invoice.paidAt`, KHÔNG phải `created_at`** — hoa hồng chỉ có thật khi khách đã trả. Invoice tạo cuối tháng 1 nhưng trả đầu tháng 2 → thuộc lương tháng 2.
- **Aggregate, KHÔNG tính lại** — chỉ cộng `items[].commissionAmount` đã snapshot ở #20. Đổi `commissionRate`/assignment về sau KHÔNG ảnh hưởng phiếu cũ. Sai commission → sửa ở nguồn (invoice), không sửa ở payroll.
- **`$match status=PAID` đứng TRƯỚC `$unwind`** — lọc bớt doc trước khi nở items (hiệu năng + đúng logic).
- **Match `items.staffId` (sau $unwind)** — chuyên viên hưởng hoa hồng. KHÔNG dùng `invoice.createdBy`/`paidBy` (thu ngân/lập đơn).
- **Snapshot bất biến** — `baseSalary`, `totalCommission`, `breakdown` đều đóng băng tại finalize. KHÔNG có recompute/overwrite. Sửa sai = `cancel` phiếu (status=CANCELLED) → `finalize` lại; partial unique index cho phép chốt lại sau hủy.
- **Partial filter dùng `$in` thay `$ne`** — MongoDB partialFilterExpression không hỗ trợ `$ne`, nên index dùng `status ∈ {FINALIZED, PAID}` (tương đương "không CANCELLED").
- **Inject Model thay vì Service** — `PayrollService` inject `InvoiceModel` + `StaffModel`, KHÔNG inject InvoiceService/EmployeeService → tránh coupling thừa.
- **`payrollCode` retry 3 lần** — phân biệt duplicate `payrollCode` vs compound `(staffId, year, month)` qua `error.keyPattern`. Compound duplicate → 409 `PAYROLL_ALREADY_EXISTS`.
- **Batch không throw khi trùng** — staff đã có phiếu active → đếm vào `skipped`, không dừng cả batch. Race condition duplicate cũng vào `skipped`.
- **`monthRange` theo giờ server** — `[new Date(y, m-1, 1), new Date(y, m, 1))`, nhất quán với cách generateInvoiceCode dùng local time.

### Pending

- [ ] Acceptance test (aggregate / finalize / batch / status flow / authorization) — repo hiện chưa có hạ tầng unit test (`.spec.ts` = 0). Verify thủ công qua Swagger / seed.
- [ ] Export Excel/PDF phiếu lương — issue Dashboard/Report (phase 2A)
- [ ] Cron tự động chốt lương cuối tháng (hiện ADMIN bấm thủ công)

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-29_001_Khanh](2026-05-29_001_Khanh.md) | 2026-05-29 | Khanh | Scaffold module Payroll: schema + 5 DTO + service (aggregate commission + finalize/batch/preview + status flow) + controller (8 endpoints) + wire app.module |
