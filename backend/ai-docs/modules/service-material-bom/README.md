## Mô tả

Module **BOM (Bill of Materials)** — định mức vật liệu tiêu hao chuẩn cho 1 lần dịch vụ. Là bảng nối Service ↔ Material với `standardQuantity`. Dùng cho **Auto Stock Deduction (#20)** khi Invoice PAID: loop BOM entries của service, trừ kho theo `standardQuantity * itemQuantity`. Không versioning, không multi-tier — out of scope MVP.

---

## Thành viên phụ trách

- **Chính:** Khanh
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `backend/src/modules/service-material-bom/`
- **Seed script:** `backend/src/scripts/seed-bom.ts` (`npm run seed:bom`)
- **Issue gốc:** [#18](../../issues/18.md)
- **Blocked by:** [#05](../../issues/05.md) (Service), [#07](../../issues/07.md) (Material)
- **Blocks:** [#20](../../issues/20.md) (Auto Stock Deduction — Invoice PAID flow)
- **Related modules:** service (#05 — ref `serviceId`), material (#07 — ref `materialId`), invoice (#19), auth (Roles/JwtAuthGuard)

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| POST | `/bom` | Tạo 1 BOM entry | `@Roles(ADMIN)` |
| GET | `/bom` | List tất cả entries (filter `serviceId` / `materialId` / `isActive`) — **không pagination** | JWT (mọi role) |
| GET | `/bom/:id` | Chi tiết 1 entry (populate cả service + material) | JWT (mọi role) |
| GET | `/bom/by-service/:serviceId` | BOM của 1 service (chỉ `isActive=true`) — dùng cho Auto Deduct #20 | JWT (mọi role) |
| GET | `/bom/by-material/:materialId` | Reverse lookup — material X dùng ở service nào | JWT (mọi role) |
| PATCH | `/bom/:id` | Sửa `standardQuantity / note / isActive` (KHÔNG sửa serviceId/materialId) | `@Roles(ADMIN)` |
| DELETE | `/bom/:id` | **Hard delete** entry | `@Roles(ADMIN)` |

> Có DELETE thật (không soft) vì BOM chỉ là config rule, lịch sử tiêu hao đã snapshot vào ledger ở Invoice PAID. Vẫn có `isActive=false` cho case tạm tắt mà không mất config.

### Schema fields chính (collection `service_material_bom`)

- `serviceId: ObjectId` ref `Service` (required)
- `materialId: ObjectId` ref `Material` (required)
- `standardQuantity: number` (min 0.0001, decimal ok) — định mức tiêu hao 1 lần dịch vụ
- `note: string` (max 500), default `''`
- `isActive: boolean` (default `true`)
- `created_at`, `updated_at` (timestamps snake_case ở DB)

### Indexes

- **Compound unique `{ serviceId: 1, materialId: 1 }`** — đảm bảo 1 cặp chỉ có 1 entry
- `{ serviceId: 1 }` (query BOM của service — phổ biến nhất)
- `{ materialId: 1 }` (reverse lookup)
- `{ isActive: 1 }` (filter)

### Seed data

15 BOM entries cho 6 dịch vụ MVP theo `DICH_VU_VA_HOA_HONG.md`:

| Service | Materials | Tổng |
|---|---|---|
| `SWEDISH_60` | OIL_SUNFLOWER (30ml), PAPER_BED (1) | 2 |
| `HOT_STONE_90` | OIL_OLIVE (30ml), PAPER_BED (1), STONE_VOLCANIC (0.01 — khấu hao) | 3 |
| `THAI_90` | BALM_PAIN_RELIEF (5g), UNIFORM_THAI (1) | 2 |
| `FOOT_45` | CREAM_FOOT (15ml), SALT_MINERAL (20g), ALCOHOL_MEDICAL (10ml) | 3 |
| `NECK_SHOULDER_30` | OIL_HERBAL (20ml), BAG_HERBAL_COMPRESS (0.05 — khấu hao) | 2 |
| `AROMA_60` | OIL_AROMA (20ml), CANDLE_AROMA (0.1 — khấu hao), PAPER_BED (1) | 3 |

Seed idempotent qua `updateOne({serviceId, materialId}, {$setOnInsert: {...}}, {upsert: true})`. Lookup `serviceId` / `materialId` runtime qua `code` của Service/Material — KHÔNG hardcode ObjectId. Throw lỗi rõ nếu service/material chưa seed (`"Hãy chạy npm run seed:services / seed:materials trước"`).

**Run order:** `seed:services` → `seed:suppliers` → `seed:materials` → `seed:bom`.

### Error codes mới

- `BOM_NOT_FOUND` — **mới thêm**
- `BOM_SERVICE_INVALID` — **mới thêm** (service không tồn tại hoặc inactive)
- `BOM_MATERIAL_INVALID` — **mới thêm** (material không tồn tại hoặc inactive)
- `BOM_ENTRY_EXISTS` — **mới thêm** (duplicate cặp serviceId-materialId)

`BOM_UNIT_MISMATCH` đã có sẵn từ trước nhưng chưa dùng (reserve cho phase validate unit BOM vs unit Material).

### Quyết định kỹ thuật quan trọng

- **`standardQuantity` lưu decimal trực tiếp** (không nhân 10000) — BOM là config, không cần precision integer như tiền. JavaScript number đủ cho `0.01 / 0.05 / 0.1`. Auto Deduct #20 sẽ cẩn thận khi accumulate.
- **Unique compound `(serviceId, materialId)`** — 1 cặp 1 entry, sửa = PATCH. Enforce qua index + tay throw 409 `BOM_ENTRY_EXISTS` cho lỗi đẹp.
- **Hard DELETE** — khác Material/Supplier (soft). BOM không có dữ liệu lịch sử cần giữ, snapshot tiêu hao thật đã vào ledger Invoice. Vẫn có `isActive=false` cho use case tạm tắt.
- **`findByService` trả `[]` khi rỗng, KHÔNG 404** — service mới có thể chưa cấu hình BOM. Auto Deduct #20 handle case empty bằng skip + log warning.
- **Populate material đầy đủ** `type / unit / stockQuantity` ở mọi endpoint — FE warning kho ngay không gọi thêm API; Auto Deduct #20 không lookup riêng material.
- **KHÔNG pagination** — 6 service × ~2-3 material = ~15-20 entries.
- **`UpdateBomDto` không expose `serviceId/materialId`** — nếu cần đổi material → xóa entry rồi tạo mới. Logic service cũng chỉ apply `standardQuantity / note / isActive`.
- **Module import `ServiceModule + MaterialModule`** (không re-declare schema) — tận dụng `exports: [MongooseModule]` ở các module đó, đồng nhất pattern.
- **Folder `service-material-bom/`** kebab-case full mô tả rõ collection. Controller route vẫn là `/bom` cho ngắn.
- **Exports `[ServiceMaterialBomService, MongooseModule]`** — Invoice #19 inject `ServiceMaterialBomService` để Auto Deduct #20 query BOM trong transaction PAID.

### Coordination với chuỗi Invoice + Auto Deduct

Khi Invoice PAID (Khánh code #19, Auto Deduct #20):
1. Inject `ServiceMaterialBomService.findByService(serviceId)` trong cùng transaction
2. Loop qua BOM entries, tính `deductQuantity = standardQuantity * itemQuantity`
3. Trừ `Material.stockQuantity` + ghi ledger entry
4. Nếu service không có BOM (array rỗng) → skip deduct, log warning, KHÔNG throw

### Pending

- [ ] Postman smoke test các test case Issue #18 mục H
- [ ] Chạy seed chain: `seed:services` → `seed:suppliers` → `seed:materials` → `seed:bom` lên Mongo dev
- [ ] Verify Swagger UI tại `/api-docs` hiển thị tag `BOM (Service-Material)`
- [ ] Mở PR link Issue #18

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-19_001_Khanh](2026-05-19_001_Khanh.md) | 2026-05-19 | Khanh | Scaffold module BOM: schema + 4 DTO + service/controller + seed 15 entries |
