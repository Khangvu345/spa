# Module: stock-ledger

> Sổ kho audit trail (immutable) — ghi mọi mutation `material.stockQuantity` trong cùng MongoDB transaction. Là core inventory tracking của dự án.

---

## Mô tả

Module Stock Ledger triển khai collection `stock_ledger` để **audit trail** mọi biến động tồn kho. Mọi thay đổi `material.stockQuantity` (nhập kho, xuất kho thủ công, trừ kho khi invoice PAID, kiểm kê) đều phải ghi 1 entry ledger trong **cùng 1 MongoDB transaction**. Không có FIFO/batches — `stockQuantity` là source of truth, ledger là lịch sử.

---

## Thành viên phụ trách

- **Chính:** Khanh
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `backend/src/modules/stock-ledger/`
- **Issue gốc:** [#19](../../issues/19.md)
- **Related modules:** material (#07 — `stockQuantity` source of truth, ref `materialId`), supplier (#06 — ref `supplierId` khi IN), auth (Roles ADMIN), invoice (#20 — sẽ inject `deductForInvoice()`)

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/stock/in` | Nhập kho 1 material | `@Roles(ADMIN)` |
| POST | `/stock/out/manual` | Xuất kho thủ công (vỡ/mất/kiểm kê) — `reason` bắt buộc | `@Roles(ADMIN)` |
| GET | `/stock/ledger` | Lịch sử ledger (pagination + filter material/type/reference/date) | JWT (mọi role) |
| GET | `/stock/ledger/by-material/:materialId` | Lịch sử ledger của 1 material | JWT (mọi role) |
| GET | `/stock/ledger/by-reference/:type/:id` | Ledger theo Invoice/Stock In/Manual/Adjustment ID | JWT (mọi role) |
| GET | `/stock/summary` | Tổng nhập/xuất theo khoảng thời gian (count, quantity, cost) | `@Roles(ADMIN)` |
| GET | `/stock/low-stock` | Materials có `stockQuantity <= reorderLevel` + supplier `{ name, phone }` | `@Roles(ADMIN)` |

### Schema fields chính (collection `stock_ledger`)

- `materialId: ObjectId` ref `Material` (required)
- `materialCode`, `materialName`, `materialUnit: string` — **snapshot** tại thời điểm transaction
- `transactionType: 'IN' | 'OUT_INVOICE' | 'OUT_MANUAL' | 'ADJUSTMENT'`
- `quantityChange: number` — `+N` cho IN/ADJUSTMENT+, `-N` cho OUT
- `stockBefore`, `stockAfter: number` — snapshot stockQuantity trước/sau
- `supplierId: ObjectId | null` ref `Supplier` (chỉ IN)
- `supplierName: string | null` — snapshot
- `unitPrice: number | null`, `totalCost: number | null` — chỉ IN
- `referenceType: 'INVOICE' | 'STOCK_IN' | 'STOCK_OUT_MANUAL' | 'ADJUSTMENT' | null`
- `referenceId: ObjectId | null` — self-ref cho STOCK_IN/STOCK_OUT_MANUAL, invoice._id cho INVOICE
- `performedBy: ObjectId` ref `Staff`
- `performedByName: string` — snapshot (hiện đang dùng `email` vì AuthenticatedUser không có `fullName`)
- `reason: string` (max 500) — bắt buộc với OUT_MANUAL
- `created_at: Date` — **KHÔNG có `updated_at`**: ledger entry immutable

### Indexes

- `{ materialId: 1, created_at: -1 }` compound — query lịch sử material phổ biến nhất
- `{ referenceType: 1, referenceId: 1 }` — lookup ledger từ Invoice/Stock In ID
- `{ transactionType: 1 }` (filter)
- `{ created_at: -1 }` (sort dashboard)
- `{ performedBy: 1 }` (audit)

### Error codes mới

- `STOCK_MATERIAL_INVALID` — material không tồn tại hoặc inactive
- `STOCK_SUPPLIER_INVALID` — supplier không tồn tại hoặc inactive
- `STOCK_LEDGER_NOT_FOUND` — placeholder (chưa expose endpoint single ledger detail)

### Quyết định kỹ thuật quan trọng

- **Stock Ledger ĐƠN GIẢN, KHÔNG FIFO** — `material.stockQuantity` là source of truth, ledger là audit trail. Mọi mutation BẮT BUỘC trong MongoDB transaction (`startSession().withTransaction()`).
- **Ledger entry IMMUTABLE** — schema dùng `timestamps: { createdAt: 'created_at', updatedAt: false }`. KHÔNG có endpoint UPDATE/DELETE. Sai → tạo ADJUSTMENT entry mới bù.
- **Snapshot toàn bộ** material/supplier/staff vào entry → báo cáo lịch sử không bị ảnh hưởng khi entity gốc đổi info.
- **Stock cho phép âm** — `stockOutManual` và `deductForInvoice` KHÔNG reject khi stock không đủ. Admin kiểm kê sau qua ADJUSTMENT. Invoice PAID không reject vì lý do kho.
- **`deductForInvoice()` internal method nhận `session` param** — Invoice service (#20) inject để wrap chung 1 transaction: invoice update + multiple stock deductions + multiple ledger entries. Method KHÔNG validate material exists (Invoice pre-validate qua BOM), KHÔNG throw nếu stock không đủ.
- **`StockIn` 1 material/request** — không multi-item (theo issue). FE click n lần nếu nhập nhiều material.
- **Decimal precision** — lưu trực tiếp, không nhân 10000. Số decimal trong dự án giới hạn (0.01, 0.05, 0.1) → JS number đủ.
- **Verify supplier `isActive` ở stockIn** — tránh nhập từ NCC đã ngừng hoạt động. Verify material `isActive` ở stockIn (không cho nhập kho cho material đã ngưng).
- **`stockOutManual` chỉ verify material tồn tại** — không check `isActive` để admin còn có thể xuất kho dọn dẹp material đã ngưng dùng.
- **`getLowStockMaterials`** dùng `$expr: { $lte: ['$stockQuantity', '$reorderLevel'] }` chỉ trên material `isActive=true`, populate supplier `{ id, name, phone }`.
- **`getSummary`** aggregate group theo `transactionType`, dùng `$abs` cho `quantity` để âm/dương đều tính dương, `$ifNull` cho `cost` (chỉ IN có totalCost).
- **`referenceId` self-ref cho STOCK_IN/STOCK_OUT_MANUAL** — pre-allocate `new Types.ObjectId()` trước khi insert để gán cả `_id` và `referenceId`. Cho phép `GET /stock/ledger/by-reference/STOCK_IN/:id` lookup chính entry đó.
- **`performedByName` snapshot dùng `email`** — vì `AuthenticatedUser` interface chỉ có `{ id, email, role, mustChangePassword }`, không có `fullName`. Nếu sau này cần tên đầy đủ → lookup Staff hoặc bổ sung vào JWT payload.
- **Controller path `/stock`**, module name `stock-ledger` — theo Issue #19 mục API Endpoints.
- **Folder flat `src/modules/stock-ledger/`** (kebab-case) — theo Issue #19 mục 11.

### Pending

- [ ] Cần MongoDB replica set hoặc Atlas để transaction chạy được. Mongo local single-node sẽ throw `"Transactions are not supported"` khi POST `/stock/in` hoặc `/stock/out/manual`.
- [ ] Postman smoke test toàn bộ test cases Issue #19 mục G
- [ ] Verify Swagger UI tại `/api-docs` hiển thị tag `Stock` đủ 7 endpoints
- [ ] Seed data demo (optional — Issue không yêu cầu)
- [ ] Mở PR link Issue #19

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-23_001_Khanh](2026-05-23_001_Khanh.md) | 2026-05-23 | Khanh | Scaffold module stock-ledger: schema + 6 DTO + service (transaction) + controller + helper `deductForInvoice` |
