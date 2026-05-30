---
id: 21
title: Module Payroll — Chốt phiếu lương hàng tháng (aggregate commission + base salary)
module: payroll
paste_date: 2026-05-24
pasted_by: Vu
status: in-progress
---

# Issue #21: Module Payroll — Phiếu lương hàng tháng

> Snapshot của issue tại thời điểm dev paste vào chat AI.

---

## Nội dung Issue (paste nguyên văn)

## Mô tả

Implement module **Payroll** (Phiếu lương) — chốt lương hàng tháng cho từng nhân viên: tổng hợp hoa hồng từ các invoice đã PAID trong tháng + lương cơ bản → tạo snapshot bất biến (`payroll_records`).

**Đây là khoảng trống lớn nhất so với PDF** — đề bài yêu cầu rõ "Phiếu lương hàng tháng: lương cơ bản, chi tiết hoa hồng theo dịch vụ, tổng thu nhập". Hiện #15 + #20 đã có `commissionRate` + snapshot `commissionAmount` trong invoice items, nhưng CHƯA có logic tổng hợp thành phiếu lương.

**Tin tốt:** hoa hồng đã được snapshot cứng trong `invoice.items[].commissionAmount` khi PAID (#20). Issue này KHÔNG tính lại hoa hồng — chỉ **aggregate** số đã có. Đây là bài toán gom dữ liệu, không phải tính toán tài chính mới.

**Công thức (đã chốt toàn dự án, bỏ KPI/thâm niên):**
```
tổng thu nhập = baseSalary + Σ(commissionAmount của các invoice PAID trong tháng)
```

**Phạm vi giới hạn:**
- ✅ Chốt lương 1 nhân viên cho 1 tháng → tạo `payroll_record` snapshot
- ✅ Chốt lương hàng loạt (tất cả STAFF có hoa hồng trong tháng) trong 1 lệnh
- ✅ Chi tiết hoa hồng theo dịch vụ (breakdown) lưu trong record
- ✅ Đánh dấu đã chi lương (status PAID)
- ✅ Query/list phiếu lương theo tháng, theo nhân viên
- ❌ KHÔNG include export Excel/PDF — issue Dashboard/Report riêng (phase 2A)
- ❌ KHÔNG include KPI/thâm niên — đã bỏ toàn dự án
- ❌ KHÔNG include phụ cấp/thưởng/phạt thủ công — out of scope MVP (có field `adjustment` để mở rộng sau, mặc định 0)
- ❌ KHÔNG include tính thuế TNCN/BHXH — out of scope MVP

## Nghiệp vụ (User stories)

- **PAY-01 Chốt lương 1 nhân viên:** ADMIN chốt lương tháng X cho 1 staff → aggregate commission từ invoice PAID + base salary → tạo snapshot
- **PAY-02 Chốt lương hàng loạt:** ADMIN chốt lương cả tháng cho mọi STAFF có phát sinh hoa hồng (hoặc mọi STAFF active) trong 1 lệnh
- **PAY-03 Xem chi tiết phiếu lương:** Hiển thị base salary + breakdown hoa hồng theo dịch vụ + tổng thu nhập
- **PAY-04 Xem danh sách:** ADMIN list phiếu lương, filter theo tháng / nhân viên / status
- **PAY-05 Đánh dấu đã chi:** ADMIN xác nhận đã trả lương cho nhân viên → status PAID
- **PAY-06 Nhân viên xem lương mình:** STAFF xem phiếu lương của chính mình (không xem được của người khác)
- **PAY-07 Hủy phiếu (sửa sai):** ADMIN hủy phiếu chưa chi lương để chốt lại (vì snapshot không cho recompute đè)

## API Endpoints

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/payrolls/finalize` | Chốt lương 1 nhân viên cho 1 tháng | `@Roles('ADMIN')` |
| POST | `/payrolls/finalize-batch` | Chốt lương hàng loạt cho 1 tháng | `@Roles('ADMIN')` |
| GET | `/payrolls` | Danh sách (filter tháng/staff/status) | `@Roles('ADMIN')` |
| GET | `/payrolls/me` | Phiếu lương của chính mình | JWT (mọi role) |
| GET | `/payrolls/:id` | Chi tiết 1 phiếu | JWT — ADMIN xem mọi phiếu, STAFF chỉ phiếu của mình |
| GET | `/payrolls/preview` | Xem trước (tính live, KHÔNG lưu) cho 1 staff + tháng | `@Roles('ADMIN')` |
| POST | `/payrolls/:id/mark-paid` | Đánh dấu đã chi lương | `@Roles('ADMIN')` |
| POST | `/payrolls/:id/cancel` | Hủy phiếu (chỉ khi chưa PAID) | `@Roles('ADMIN')` |

> KHÔNG có recompute/overwrite. Sửa sai = cancel phiếu cũ → finalize lại. Lý do: snapshot pattern bất biến cho financial data (đã chốt toàn dự án).
> `/payrolls/preview` cho ADMIN xem thử số trước khi chốt — tính on-the-fly, không tạo record.
>
> ⚠️ **`preview` ở đây = "tính thử/nháp", KHÔNG phải "xem trước bản in PDF".** Nó tính ra con số rồi trả về màn hình mà KHÔNG ghi DB, để admin xem hợp lý mới bấm finalize. Việc xuất phiếu lương đã chốt ra file PDF/Excel để in là chuyện KHÁC, thuộc issue Dashboard/Report (phase 2A). Phân biệt:
> - `preview` (issue này): TRƯỚC khi chốt · tính thử · ra số trên màn hình · không ghi DB
> - export PDF (issue Report): SAU khi chốt · lấy phiếu đã có · ra file tải về

## Acceptance Criteria

### A. Schema `payroll_records` (MongoDB collection: `payroll_records`)

```typescript
{
  payrollCode: string;        // unique, 'PAY-YYYYMM-NNNN'

  // Kỳ lương
  periodYear: number;         // VD: 2026
  periodMonth: number;        // 1-12

  // Nhân viên (snapshot — không reference live)
  staffId: ObjectId;          // ref Staff
  staffSnapshot: {
    fullName: string;
    role: string;             // snapshot role tại thời điểm chốt
  };

  // Thành phần lương (tất cả snapshot tại thời điểm finalize)
  baseSalary: number;         // copy từ staff.baseSalary tại thời điểm chốt
  totalCommission: number;    // Σ commissionAmount từ invoice PAID trong tháng
  adjustment: number;         // phụ cấp/phạt thủ công, default 0 (mở rộng sau)
  totalIncome: number;        // = baseSalary + totalCommission + adjustment

  // Chi tiết hoa hồng theo dịch vụ (cho PDF yêu cầu "chi tiết hoa hồng theo dịch vụ")
  commissionBreakdown: [{
    serviceId: ObjectId;
    serviceName: string;      // snapshot
    serviceCount: number;     // số lượt dịch vụ này trong tháng
    totalCommission: number;  // tổng hoa hồng từ dịch vụ này
  }];

  // Truy vết nguồn — danh sách invoice đã gộp (audit)
  sourceInvoiceIds: ObjectId[];   // các invoice PAID đã tính vào phiếu này
  invoiceCount: number;           // số invoice gộp

  status: 'FINALIZED' | 'PAID' | 'CANCELLED';
                              // FINALIZED = đã chốt, chờ chi
                              // PAID = đã chi lương cho nhân viên
                              // CANCELLED = hủy để chốt lại

  // Audit
  finalizedBy: ObjectId;      // ADMIN chốt
  finalizedByName: string;
  finalizedAt: Date;

  paidAt: Date | null;        // thời điểm đánh dấu đã chi
  paidBy: ObjectId | null;

  cancelledAt: Date | null;
  cancelledBy: ObjectId | null;
  cancelReason: string | null;

  note: string;

  createdAt: Date;
  updatedAt: Date;
}
```

**Constraints:**
- **UNIQUE compound `(staffId, periodYear, periodMonth)` partial WHERE status != 'CANCELLED'** — mỗi nhân viên chỉ có 1 phiếu ACTIVE cho 1 tháng. Phiếu CANCELLED không tính → cho phép chốt lại sau khi hủy.
  - Khi finalize mà đã tồn tại phiếu active → 409 `PAYROLL_ALREADY_EXISTS`.

**Indexes cần tạo:**
- `payrollCode` (unique)
- Compound partial unique `(staffId, periodYear, periodMonth)` WHERE status != CANCELLED
- `(periodYear, periodMonth)` (filter theo tháng)
- `staffId` (filter — xem lịch sử lương 1 người)
- `status`

### B. DTOs

- [ ] `FinalizePayrollDto`:
  - `staffId` (IsMongoId)
  - `periodYear` (IsInt, Min 2020, Max 2100)
  - `periodMonth` (IsInt, Min 1, Max 12)
  - `adjustment` (IsInt, optional, default 0) — cho phép âm (phạt) lẫn dương (thưởng)
  - `note` (IsString, optional, max 500)

- [ ] `FinalizeBatchDto`:
  - `periodYear` (IsInt)
  - `periodMonth` (IsInt, 1-12)
  - `onlyWithCommission` (IsBoolean, optional, default true)
    - true: chỉ chốt staff có phát sinh hoa hồng trong tháng
    - false: chốt mọi STAFF active (kể cả chỉ có base salary, hoa hồng = 0)

- [ ] `PreviewPayrollDto`:
  - `staffId` (IsMongoId)
  - `periodYear`, `periodMonth`

- [ ] `QueryPayrollDto`:
  - `page`, `limit`
  - `periodYear?`, `periodMonth?`
  - `staffId?: string`
  - `status?: PayrollStatus`
  - `sortBy?: 'finalizedAt' | 'totalIncome'` (default `finalizedAt`)
  - `sortOrder?: 'asc' | 'desc'` (default `desc`)

- [ ] `CancelPayrollDto`:
  - `reason` (IsString, required, max 500)

### C-PRE. Field Reference — ĐỌC TRƯỚC KHI VIẾT PIPELINE (chống lẫn biến)

> Aggregation gom dữ liệu từ nhiều tầng lồng nhau (`invoice` → `items[]` → field). Cái bẫy lớn nhất là **lẫn field cùng tên ở các tầng khác nhau**. Bảng này liệt kê chính xác field nào ở tầng nào. Gõ theo bảng, KHÔNG tự nhớ.

**Cấu trúc thật của `invoice` (tham chiếu `invoice.schema.ts`):**

```
invoice (cấp ngoài)
├── _id                    ← gom vào sourceInvoiceIds
├── status                 ← LỌC = 'PAID' ở đây (cấp invoice)
├── paidAt                 ← LỌC THEO THÁNG ở đây (cấp invoice)   ⚠️ KHÔNG phải created_at
├── created_at             ← KHÔNG dùng để lọc lương (đây là lúc TẠO, không phải lúc THU tiền)
├── createdBy / paidBy     ← nhân viên LẬP/THU hóa đơn — KHÔNG phải người hưởng hoa hồng ⚠️
└── items[]  (mảng — phải $unwind mới truy cập được field bên trong)
     ├── items.staffId          ← CHUYÊN VIÊN hưởng hoa hồng — MATCH Ở ĐÂY (sau $unwind)
     ├── items.staffName        ← snapshot tên chuyên viên
     ├── items.serviceId        ← GROUP theo cái này
     ├── items.serviceName      ← snapshot tên dịch vụ
     ├── items.quantity         ← SỐ LƯỢT → cộng vào serviceCount
     ├── items.commissionAmount ← TIỀN hoa hồng → cộng vào totalCommission
     ├── items.commissionRate   ← % (KHÔNG cộng — chỉ để hiển thị nếu cần)
     ├── items.subtotal         ← doanh thu dịch vụ (KHÔNG phải hoa hồng) ⚠️
     └── items.unitPrice        ← giá (KHÔNG dùng cho lương)
```

**Bảng "dùng cái này — KHÔNG dùng cái kia":**

| Mục đích | DÙNG | KHÔNG nhầm sang |
|---|---|---|
| Lọc đã thanh toán | `invoice.status = 'PAID'` (cấp ngoài) | — |
| Lọc theo tháng | `invoice.paidAt` (cấp ngoài) | `created_at`, `cancelledAt` |
| Lọc đúng chuyên viên | `items.staffId` (sau $unwind) | `invoice.createdBy`, `invoice.paidBy`, `staffId` cấp ngoài (KHÔNG tồn tại) |
| Cộng số lượt dịch vụ | `items.quantity` | `items.commissionAmount` |
| Cộng tiền hoa hồng | `items.commissionAmount` | `items.subtotal`, `items.unitPrice`, `items.commissionRate` |
| Group dịch vụ | `items.serviceId` | `items.serviceOrderItemId` |

**3 lỗi IM LẶNG nguy hiểm nhất (ra số SAI nhưng vẫn có số, khó phát hiện):**
1. Lọc `created_at` thay vì `paidAt` → sai tháng, nhưng vẫn ra một con số → trông như đúng.
2. Cộng `subtotal` thay vì `commissionAmount` → ra doanh thu thay vì hoa hồng (số to bất thường).
3. Match `invoice.createdBy` (thu ngân) thay vì `items.staffId` (chuyên viên) → tính hoa hồng cho NHẦM người.

> **Snake_case vs camelCase:** schema map `paidAt` qua `@Prop` nhưng `created_at` để snake_case (xem timestamps option). Trong pipeline raw, kiểm tra tên field THẬT trong MongoDB (có thể là `paidAt` hoặc `paid_at` tùy cách `@Prop({ name })`). **Verify bằng cách `db.invoices.findOne()` xem tên field thật trước khi viết `$match`.** Đây là nguồn lỗi "pipeline trả rỗng" số 1.

---

### C. PayrollService — Aggregation logic (TRỌNG TÂM)

- [ ] `aggregateCommission(staffId, year, month): Promise<{ totalCommission, breakdown, invoiceIds, invoiceCount }>`
  - **Đây là core logic.** Pipeline trên collection `invoices`:
    ```
    1. $match:
       - status = 'PAID'
       - paid_at >= đầu tháng (year-month-01 00:00) AND paid_at < đầu tháng sau
         ⚠️ LỌC THEO paidAt, KHÔNG phải created_at (đã chốt: mốc = thời điểm thực thu)
    2. $unwind: '$items'
    3. $match: 'items.staffId' = staffId   (lọc item của đúng nhân viên)
    4. $group theo items.serviceId:
       - serviceName: $first
       - serviceCount: $sum '$items.quantity'
       - totalCommission: $sum '$items.commissionAmount'
       - đồng thời gom invoiceId vào set
    5. Tổng hợp:
       - totalCommission = sum các nhóm
       - breakdown = mảng các nhóm
       - sourceInvoiceIds = distinct invoice _id
    ```
  - ⚠️ `$match status=PAID` PHẢI đứng TRƯỚC `$unwind` (hiệu năng + đúng logic).
  - Trả về cả `invoiceIds` để lưu `sourceInvoiceIds` (audit truy vết).

- [ ] `finalize(dto, currentUser): Promise<PayrollResponseDto>`
  - Verify staff tồn tại
  - Check đã có phiếu active `(staffId, year, month)` chưa → 409 `PAYROLL_ALREADY_EXISTS`
  - Gọi `aggregateCommission` → có totalCommission + breakdown + invoiceIds
  - Snapshot `baseSalary` từ `staff.baseSalary` HIỆN TẠI
  - Snapshot `staffSnapshot` (fullName, role)
  - `totalIncome = baseSalary + totalCommission + adjustment`
  - Generate `payrollCode` 'PAY-YYYYMM-NNNN'
  - status = FINALIZED
  - Lưu record

- [ ] `finalizeBatch(dto, currentUser): Promise<{ created: number, skipped: number, details }>`
  - Lấy danh sách staff theo `onlyWithCommission`:
    - true → query distinct `items.staffId` từ invoice PAID trong tháng
    - false → mọi staff role STAFF + workStatus ACTIVE
  - Loop finalize từng staff
  - Staff đã có phiếu active → skip (không throw), đếm vào `skipped`
  - Trả summary

- [ ] `preview(dto): Promise<PayrollPreviewDto>`
  - Gọi `aggregateCommission` → trả kết quả tính LIVE, KHÔNG lưu DB
  - Dùng cho ADMIN xem thử trước khi chốt

- [ ] `markPaid(id, currentUser)`
  - Verify status = FINALIZED → nếu PAID rồi → 400 `PAYROLL_ALREADY_PAID`
  - Set status=PAID, paidAt, paidBy

- [ ] `cancel(id, dto, currentUser)`
  - Verify status != PAID → nếu đã chi lương rồi không cho hủy (400)
  - Set status=CANCELLED, cancelReason
  - (Sau khi cancel, ADMIN có thể finalize lại tháng đó)

- [ ] `findMine(currentUser, query)` — phiếu của chính `currentUser.id`
- [ ] `findOne(id, currentUser)` — STAFF chỉ xem phiếu staffId = mình, khác → 403

### D. PayrollController

- [ ] `POST /payrolls/finalize` `@Roles('ADMIN')`
- [ ] `POST /payrolls/finalize-batch` `@Roles('ADMIN')`
- [ ] `GET /payrolls` `@Roles('ADMIN')`
- [ ] `GET /payrolls/me` JWT
- [ ] `GET /payrolls/preview` `@Roles('ADMIN')`
- [ ] `GET /payrolls/:id` JWT + check ownership cho STAFF
- [ ] `POST /payrolls/:id/mark-paid` `@Roles('ADMIN')`
- [ ] `POST /payrolls/:id/cancel` `@Roles('ADMIN')`

### E. Error Codes (ĐÃ CÓ SẴN trong error-codes.ts — chỉ dùng, không thêm)

```typescript
PAYROLL_ALREADY_EXISTS:   'PAYROLL_ALREADY_EXISTS',   // finalize khi đã có phiếu active
PAYROLL_NOT_FOUND:        'PAYROLL_NOT_FOUND',        // GET/:id không tồn tại
PAYROLL_ALREADY_PAID:     'PAYROLL_ALREADY_PAID',     // mark-paid/cancel khi đã PAID
```
> Nếu cần thêm cho ownership: dùng `FORBIDDEN` có sẵn (STAFF xem phiếu người khác).

### F. Module Dependencies

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayrollRecord.name, schema: PayrollRecordSchema },
      { name: Invoice.name, schema: InvoiceSchema },  // ⭐ để aggregate
      { name: Staff.name, schema: StaffSchema },       // ⭐ lookup baseSalary
    ]),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
```
> Inject `InvoiceModel` + `StaffModel` (Mongoose model), KHÔNG cần InvoiceService/EmployeeService — chỉ đọc aggregate + lookup base salary. Tránh coupling thừa.

## Testing — Acceptance Test Cases

**Aggregate logic:**
- [ ] Staff có 3 invoice PAID trong tháng (2 cùng service, 1 service khác) → totalCommission = tổng đúng, breakdown gộp đúng theo service
- [ ] Invoice DRAFT/PENDING/CANCELLED trong tháng → KHÔNG tính vào
- [ ] Invoice PAID nhưng `paidAt` tháng khác → KHÔNG tính (lọc theo paidAt đúng)
- [ ] Invoice PAID có items của nhiều staff → chỉ gom items của đúng staffId
- [ ] Staff không có invoice nào trong tháng → totalCommission=0, breakdown=[]

**Finalize:**
- [ ] Finalize staff có hoa hồng → totalIncome = baseSalary + totalCommission, status=FINALIZED
- [ ] Finalize lần 2 cùng (staff, tháng) → 409 PAYROLL_ALREADY_EXISTS
- [ ] Finalize với adjustment=+500000 → totalIncome cộng thêm đúng
- [ ] Finalize với adjustment=-200000 (phạt) → totalIncome trừ đúng
- [ ] Snapshot integrity: finalize xong → ADMIN sửa staff.baseSalary → GET phiếu cũ vẫn giữ baseSalary lúc chốt
- [ ] Snapshot integrity: finalize xong → reassign commissionRate → totalCommission phiếu cũ không đổi (vì đọc từ invoice snapshot, không phải live rate)

**Batch:**
- [ ] finalize-batch onlyWithCommission=true → chỉ tạo phiếu cho staff có hoa hồng
- [ ] finalize-batch onlyWithCommission=false → tạo cả staff hoa hồng=0 (chỉ base salary)
- [ ] finalize-batch khi vài staff đã có phiếu → skip những staff đó, summary đếm đúng created/skipped

**Preview:**
- [ ] GET preview → trả số đúng nhưng KHÔNG tạo record (verify collection không tăng)
- [ ] GET preview rồi finalize → 2 lần ra cùng số (consistency)

**Status flow:**
- [ ] mark-paid phiếu FINALIZED → status=PAID, paidAt set
- [ ] mark-paid phiếu đã PAID → 400 PAYROLL_ALREADY_PAID
- [ ] cancel phiếu FINALIZED → status=CANCELLED
- [ ] cancel phiếu PAID → 400 (đã chi lương không hủy được)
- [ ] cancel xong → finalize lại cùng (staff, tháng) → success (vì phiếu cũ CANCELLED không tính unique)

**Authorization:**
- [ ] STAFF gọi GET /payrolls/me → chỉ thấy phiếu của mình
- [ ] STAFF gọi GET /payrolls/:id của người khác → 403
- [ ] STAFF gọi POST /finalize → 403
- [ ] ADMIN gọi GET /payrolls/:id bất kỳ → 200

## Out of scope

- ❌ Export Excel/PDF phiếu lương — issue Dashboard/Report (phase 2A)
- ❌ KPI/thâm niên trong commission — bỏ toàn dự án
- ❌ Thuế TNCN, BHXH, các khoản khấu trừ — out of scope MVP
- ❌ Phụ cấp/thưởng có quy tắc — chỉ có `adjustment` thủ công
- ❌ Lịch sử điều chỉnh phiếu (audit từng lần sửa) — dùng cancel + finalize lại
- ❌ Tự động cron chốt lương cuối tháng — ADMIN bấm thủ công
- ❌ Đối chiếu chênh lệch giữa các tháng — out of scope

## Dependencies

- Blocked by: **Issue #20** (Invoice — cần `items[].commissionAmount` snapshot + `paidAt`), **Issue #02** (Staff — `baseSalary`)
- Blocks: Dashboard/Report (phase 2A — sẽ export phiếu lương ra Excel)

## Estimate

5-7h code + test (logic aggregate + status flow; không phức tạp như #20 vì không có transaction cross-module)

---

## Context bổ sung từ dev

**Quyết định kỹ thuật đã chốt:**

1. **Mốc thời gian = `paidAt`, KHÔNG phải `created_at`** — hoa hồng chỉ có thật khi khách đã trả tiền. Invoice tạo cuối tháng 1 nhưng trả đầu tháng 2 → thuộc lương tháng 2. Khớp nguyên tắc "ghi nhận khi thực thu". Index `paidAt: -1` đã có sẵn ở #20 → aggregate nhanh.

2. **Snapshot pattern bắt buộc (đã chốt toàn dự án)** — `baseSalary`, `totalCommission`, `breakdown` đều snapshot tại thời điểm finalize. Phiếu lương là CHỨNG TỪ bất biến. Sửa staff.baseSalary hay reassign commissionRate sau đó KHÔNG ảnh hưởng phiếu cũ.

3. **KHÔNG recompute đè** — đã chốt là khóa. Sửa sai = cancel phiếu (status=CANCELLED) rồi finalize lại. Unique index partial WHERE status != CANCELLED cho phép điều này.

4. **KHÔNG tính lại hoa hồng** — chỉ aggregate `commissionAmount` đã snapshot trong invoice items (#20). Issue này là bài toán GOM dữ liệu, không phải tính toán tài chính. Nếu sau này phát hiện commission sai → sửa ở nguồn (invoice), không sửa ở payroll.

5. **`adjustment` mặc định 0** — chuẩn bị sẵn cho thưởng/phạt thủ công sau, MVP không dùng đến. Cho phép âm (phạt) lẫn dương (thưởng).

6. **`sourceInvoiceIds` lưu để truy vết** — ADMIN/giảng viên có thể đối chiếu phiếu lương ngược về từng invoice. Tăng tính thuyết phục khi demo.

   **Quy trình audit khi nghi số sai (dùng khi debug):**
   - Phiếu lương ra số lạ → mở `sourceInvoiceIds` → query đúng các invoice đó → tự cộng tay `commissionAmount` của items có `staffId` khớp → so với `totalCommission` trong phiếu.
   - Nếu phiếu có invoice KHÔNG nên có (vd thuộc tháng khác) → bug ở `$match paidAt`.
   - Nếu THIẾU invoice đáng lẽ phải có → kiểm tra invoice đó `status` đã PAID chưa, `paidAt` có rơi đúng tháng không.
   - Nếu tiền lệch nhưng đúng danh sách invoice → kiểm tra có cộng nhầm `subtotal` thay `commissionAmount` không (xem bảng C-PRE).
   - Vì phiếu là snapshot, `sourceInvoiceIds` đóng băng đúng tập invoice tại thời điểm chốt → audit luôn tái hiện được, kể cả sau khi invoice gốc đổi.

7. **Preview tách riêng** — ADMIN xem thử số trước khi chốt cứng, tránh chốt nhầm rồi phải cancel. Tính live, không lưu.

8. **`$match status=PAID` đứng TRƯỚC `$unwind`** — cả về hiệu năng (lọc bớt doc trước khi nở items) lẫn đúng logic (chỉ tính invoice đã thanh toán).

9. **Inject Model thay vì Service** — PayrollService inject `InvoiceModel` + `StaffModel`, không inject InvoiceService/EmployeeService. Chỉ cần đọc aggregate + lookup base salary, tránh coupling thừa.

10. **Folder structure:** `src/modules/payroll/` (flat).

11. **Lưu ý cho FE:** GET /payrolls/:id trả đủ `commissionBreakdown` để render bảng "chi tiết hoa hồng theo dịch vụ" đúng yêu cầu PDF. FE chỉ việc map mảng → bảng (serviceName, serviceCount, totalCommission), cộng baseSalary ở header, totalIncome ở footer.

---

## Logs liên quan

<!-- Tự động cập nhật khi tạo log mới (Workflow B bước 5) -->

---

## Trạng thái

- `in-progress` — đang code
- `done` — đã merge, hoàn thành
- `cancelled` — bỏ, không làm nữa
