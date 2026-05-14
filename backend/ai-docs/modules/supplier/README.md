## Mô tả

Module quản lý **nhà cung cấp (Supplier)** — nguồn cung vật liệu cho spa. Là **Module Kho phase 1a**, chuẩn bị nguồn cung cấp trước khi quản lý Material (Issue #07). Sẽ được tham chiếu từ `stock_receipts` (phiếu nhập) và `materials.supplierId` về sau.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `backend/src/modules/supplier/`
- **Seed script:** `backend/src/scripts/seed-suppliers.ts` (`npm run seed:suppliers`)
- **Issue gốc:** [#06](../../issues/06.md)
- **Related modules:** auth (Roles/JwtAuthGuard), inventory/material (#07 sẽ ref `supplierId`), stock-receipt (phase 2 Kho)

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/suppliers` | Tạo NCC mới | `@Roles(ADMIN)` |
| GET | `/suppliers` | Danh sách + search + filter + sort + pagination (default 10/trang) | JWT (mọi role) |
| GET | `/suppliers/:id` | Chi tiết | JWT (mọi role) |
| PATCH | `/suppliers/:id` | Cập nhật / toggle `isActive` | `@Roles(ADMIN)` |

> Không có DELETE — soft delete qua `PATCH { isActive: false }`. Lý do: Material sẽ ref `supplierId`, hard delete sẽ broken historical reference.

### Schema fields chính (collection `suppliers`)

- `name: string` (2-200) — KHÔNG unique (cho phép trùng tên, vd 2 chi nhánh)
- `contactPerson: string` (2-100)
- `phone: string` (regex `/^[0-9]{10}$/` — 10 chữ số VN)
- `email: string` optional — validate `IsEmail` nếu có giá trị, default `''`
- `address: string` (5-500)
- `taxCode: string` optional (max 20) — **unique nếu có giá trị** (check ở service)
- `note: string` optional (max 1000)
- `isActive: boolean` (default `true`)
- `created_at`, `updated_at` (timestamps — snake_case ở DB qua option `timestamps`)

### Indexes

- `{ name: 1 }`
- `{ phone: 1 }`
- `{ isActive: 1 }`
- `{ taxCode: 1 }` (non-unique — uniqueness check do service handle vì taxCode optional)

### Seed data

5 NCC mẫu (Issue #06 mục E) — Hương Việt, Minh Anh, Đá quý Thiên Nhiên, Thảo Mộc Việt, Bách Hóa ABC. Seed idempotent qua combo `(name, phone)` để check existence trước khi insert (vì không có unique strict).

### Error codes mới

- `SUPPLIER_NOT_FOUND` — đã có sẵn ở `shared/constants/error-codes.ts`
- `SUPPLIER_TAX_CODE_EXISTS` — **mới thêm** ở session này

### Quyết định kỹ thuật quan trọng

- **Không duplicate-check `name`** — vì 1 công ty có thể có nhiều chi nhánh, hoặc 2 supplier khác nhau cùng tên. Chỉ unique check trên `taxCode` (nếu có giá trị) — trả 409 `SUPPLIER_TAX_CODE_EXISTS`.
- **`email`, `taxCode` optional** — validate format chỉ khi có giá trị. Default `''` lưu DB cho gọn (tránh field không tồn tại).
- **GET list cho mọi role JWT** (không chỉ ADMIN) — vì receptionist/staff có thể cần tra cứu supplier. ADMIN-only chỉ cho POST/PATCH.
- **Không expose DELETE** — soft delete qua `isActive=false`. Lý do: tránh broken ref khi Material/StockReceipt tham chiếu supplier.
- **Phone 10 số VN** — `Matches(/^[0-9]{10}$/)`. Chưa support format quốc tế `+84`.
- **Sort fields:** chỉ cho `name` và `createdAt` (theo Issue #06). Default `createdAt desc`.
- **Search:** `$or` regex case-insensitive trên `name` hoặc `phone` — escape special regex chars để tránh ReDoS.
- **Default `limit = 10`** (override DEFAULT_LIMIT=20) — theo Issue #06 mục SUP-01 ("pagination 10 items/page").
- **Folder structure flat ở `src/modules/supplier/`** (không nest trong `inventory/supplier/`) — theo chỉ định Issue #06 mục context bổ sung điểm 6.

### Pending

- [ ] Postman smoke test 20 test cases (Issue #06 mục G)
- [ ] Verify Swagger UI hiển thị đúng `@ApiProperty`
- [ ] Chạy `npm run seed:suppliers` lên Mongo dev để có data demo
- [ ] Mở PR `feature-6_supplier` link Issue #06

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-14_001_Khanh](2026-05-14_001_Khanh.md) | 2026-05-14 | Khang | Scaffold module Supplier: schema + 4 DTO + service/controller + seed 5 NCC |
