# Module: [Tên module]

> Living state document — cập nhật khi đóng session ⚠️. AI đọc đây thay vì replay logs.

---

## Mô tả

<!-- 1-2 câu module này làm gì, giải bài toán nghiệp vụ nào -->

---

## Thành viên phụ trách

- **Chính:** <!-- dev name -->
- **Hỗ trợ:** <!-- dev name hoặc "—" -->

---

## Liên kết

- **Code:** `src/<path>`
- **API spec:** <!-- link nếu có -->
- **Related modules:** <!-- module khác có dependency -->

---

## Hiện trạng (Current Snapshot)

> Đây là source of truth cho "module hiện trạng". Cập nhật khi đóng session ⚠️.
> Mục đích: AI đọc 1 đoạn này biết module ở đâu, không phải replay 5 logs.

### Endpoints đã implement

| Method | Path | Mô tả |
|---|---|---|
| GET | `/<resource>` | Danh sách với pagination |
| GET | `/<resource>/:id` | Chi tiết |
| POST | `/<resource>` | Tạo mới |
| PATCH | `/<resource>/:id` | Cập nhật |
| DELETE | `/<resource>/:id` | Soft delete |

### Schema fields chính

- `fieldName: type` — ghi chú nếu có quyết định nghiệp vụ đặc biệt
- `referenceField: ObjectId` — ref tới Entity X
- ...

### Quyết định kỹ thuật quan trọng

> Ghi các quyết định ảnh hưởng dài hạn, không nằm trong code obvious.
> Vd:
> - Dùng embed thay vì reference cho `servicesSnapshot` vì cần snapshot giá tại thời điểm thanh toán
> - `studentId` đang là string vì module hoc-vien chưa có; sẽ migrate ObjectId+ref sau

-

### Pending

> Việc còn nợ trong module này, không gắn với 1 dev cụ thể.
> Vd: chưa có JWT guard, chưa có search by name, chưa có index trên field X.

- [ ] ...

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| <!-- [2026-05-12_001_khanhbpn](2026-05-12_001_khanhbpn.md) --> | <!-- date --> | <!-- dev --> | <!-- 1 dòng --> |
