## Mô tả

Module quản lý **vật liệu (Material)** — kho vật tư tiêu hao và khấu hao của spa. Là **Module Kho phase 1b**, làm sau Supplier (#06). Field `stockQuantity` được lưu nhưng **chưa có logic stock movement** — sẽ implement ở phase 2 (stock_ledger / material_batches).

---

## Thành viên phụ trách

- **Chính:** Khanh
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `backend/src/modules/material/`
- **Seed script:** `backend/src/scripts/seed-materials.ts` (`npm run seed:materials`)
- **Issue gốc:** [#07](../../issues/07.md)
- **Related modules:** auth (Roles/JwtAuthGuard), supplier (#06 — ref `supplierId`), service-material (BOM, phase 2), stock_receipt / stock_issue (phase 2 Kho)

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/materials` | Tạo vật liệu mới | `@Roles(ADMIN)` |
| GET | `/materials` | Danh sách + search + filter (isActive/type/supplierId) + sort + pagination | JWT (mọi role) |
| GET | `/materials/:id` | Chi tiết (populate supplier `{ id, name }`) | JWT (mọi role) |
| PATCH | `/materials/:id` | Cập nhật / toggle `isActive` | `@Roles(ADMIN)` |

> Không có DELETE — soft delete qua `PATCH { isActive: false }`. Lý do: BOM (#service_materials) và stock history sẽ ref `materialId`, hard delete sẽ broken historical reference.

### Schema fields chính (collection `materials`)

- `code: string` (3-30, regex `/^[A-Z0-9_]+$/`, unique, uppercase)
- `name: string` (2-200)
- `description: string` optional (max 1000), default `''`
- `unit: string` (1-20) — `ml | gram | piece | set`
- `type: 'CONSUMABLE' | 'DEPRECIATION'`
- `unitPrice: number` (integer, min 0) — VND/đơn vị, giá tham khảo
- `stockQuantity: number` (decimal ok, min 0) — tồn kho hiện tại, default 0
- `reorderLevel: number` (decimal ok, min 0) — ngưỡng cảnh báo nhập thêm, default 0
- `expectedUsesPerUnit: number` (min 0) — required>0 khi `type=DEPRECIATION`, default 0 cho CONSUMABLE
- `supplierId: ObjectId` ref `Supplier` (required)
- `isActive: boolean` (default `true`)
- `created_at`, `updated_at` (timestamps snake_case ở DB qua option `timestamps`)

### Indexes

- `{ code: 1 }` (unique — qua `@Prop({ unique: true })`)
- `{ name: 1 }` (search)
- `{ supplierId: 1 }` (filter)
- `{ type: 1 }` (filter)
- `{ isActive: 1 }` (filter)
- `{ isActive: 1, type: 1 }` compound (query phổ biến)

### Seed data

15 vật liệu (Issue #07 mục E + 2 bonus: `TOWEL_BATH`, `INCENSE_STICK` để đủ 15 cover 6 dịch vụ massage):
- 4 tinh dầu (`OIL_*`) — supplier Hương Việt
- 3 vật tư y tế / đồng phục (`PAPER_BED`, `ALCOHOL_MEDICAL`, `UNIFORM_THAI`, `TOWEL_BATH`) — supplier Minh Anh
- 2 thảo mộc (`BALM_PAIN_RELIEF`, `BAG_HERBAL_COMPRESS`) — supplier Thảo Mộc Việt
- 4 vật tư phụ (`CREAM_FOOT`, `SALT_MINERAL`, `CANDLE_AROMA`, `INCENSE_STICK`) — supplier Bách Hóa
- 1 đá núi lửa (`STONE_VOLCANIC`) — supplier Đá quý Thiên Nhiên

Seed idempotent qua `updateOne({code}, {$setOnInsert: {...}}, {upsert: true})`. Lookup `supplierId` runtime qua keyword tên supplier — KHÔNG hardcode ObjectId. Nếu chưa seed supplier → throw lỗi rõ ràng `"Hãy chạy npm run seed:suppliers trước"`.

### Error codes mới

- `MATERIAL_NOT_FOUND` — đã có sẵn ở `shared/constants/error-codes.ts`
- `MATERIAL_CODE_EXISTS` — đã có sẵn
- `MATERIAL_SUPPLIER_INVALID` — **mới thêm**
- `MATERIAL_DEPRECIATION_USES_REQUIRED` — **mới thêm**

### Quyết định kỹ thuật quan trọng

- **`stockQuantity` lưu trong schema nhưng chưa có logic stock movement** — chỉ admin update tay qua PATCH cho tới khi `stock_ledger` xuất hiện (phase 2 Kho). Không trừ stock khi invoice PAID trong scope issue này.
- **`stockQuantity` chấp nhận decimal** — vì DEPRECIATION có thể có giá trị 0.5 bộ đá còn lại sau 50 lần dùng.
- **`supplierId` required + verify isActive khi CREATE** — tránh link material mới với supplier đã ngừng hoạt động. PATCH chỉ verify supplier tồn tại (không bắt buộc isActive=true) để không cascade khi supplier bị deactivate sau.
- **`code` auto uppercase + trim** — convention tránh duplicate `oil_olive` vs `OIL_OLIVE`. Validation regex `^[A-Z0-9_]+$` cho phép input chữ HOA, service auto-upper trước khi insert/check duplicate.
- **DEPRECIATION require `expectedUsesPerUnit > 0`** — check ở cả CREATE và UPDATE (khi đổi `type` sang DEPRECIATION hoặc khi đang DEPRECIATION mà set expectedUsesPerUnit về 0/null).
- **Populate supplier khi GET** — list và detail đều populate `supplierId` → `{ id, name }` (chỉ trả 2 field name, không expose full supplier). FE hiển thị tên NCC không cần gọi thêm API.
- **GET list cho mọi role JWT** — receptionist/staff cần tra cứu material (vd: chuẩn bị ca massage). POST/PATCH chỉ ADMIN.
- **Không expose DELETE** — soft delete qua `isActive=false`. Lý do: BOM (service_materials) và stock history (phase 2) ref materialId.
- **PATCH cho phép sửa `stockQuantity` thủ công** — tạm cho MVP. Sau khi `stock_ledger` có → REMOVE khỏi UpdateMaterialDto, ép qua endpoint nhập kho riêng.
- **Default `limit = 10`** override `DEFAULT_LIMIT = 20` (giống pattern Supplier) — theo Issue #07 mục QueryMaterialDto.
- **Search escape ReDoS** — `query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` trước khi regex.
- **Folder flat `src/modules/material/`** (không nest `inventory/material/`) — đồng nhất với pattern Supplier.

### Pending

- [ ] Postman smoke test các test case Issue #07 mục G
- [ ] Chạy `npm run seed:suppliers` → `npm run seed:materials` lên Mongo dev để có data demo
- [ ] Verify Swagger UI tại `/api-docs` hiển thị tag `Materials`
- [ ] Mở PR link Issue #07

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-14_002_Khanh](2026-05-14_002_Khanh.md) | 2026-05-14 | Khanh | Scaffold module Material: schema + 4 DTO + service/controller + seed 15 vật liệu |
