# Timeline — Master log index

> Tất cả logs, **mới nhất trên đầu**. AI dùng để tra lịch sử team theo thời gian.
> STATUS.md = hiện tại; TIMELINE.md = lịch sử.

---

## Logs

| Ngày | # | Dev | Module | Issue | Tóm tắt | Code? | Link |
|---|---|---|---|---|---|---|---|
| 2026-05-14 | 001 | Khang | supplier | [#06](issues/06.md) | Scaffold module Supplier CRUD + seed 5 NCC | ⚠️ | [log](modules/supplier/2026-05-14_001_Khanh.md) |
| 2026-05-13 | 002 | Khanh | service | [#05](issues/05.md) | Fix GET /services trả rỗng do filter snake_case không khớp DB camelCase | ⚠️ | [log](modules/service/2026-05-13_002_Khanh.md) |
| 2026-05-13 | 001 | Khanh | service | [#05](issues/05.md) | Scaffold module Service CRUD + seed 6 dịch vụ | ⚠️ | [log](modules/service/2026-05-13_001_Khanh.md) |
| 2026-05-12 | 001 | Khang | auth | [#02](issues/02.md) | Implement auth core JWT/RBAC + Staff schema | ⚠️ | [log](modules/auth/2026-05-12_001_Khang.md) |
|---|---|---|---|---|---|---|---|

---

## Statistics

> Cập nhật thủ công hoặc bỏ qua nếu không cần.

- **Tổng logs:** 3
- **Per-dev:**
  - Khang: 1 log
  - Khanh: 2 logs
- **Per-module:**
  - auth: 1 log
  - service: 2 logs

---

## Quy tắc

- Mới nhất trên đầu (newest first)
- Mỗi log = 1 row
- Cột `Code?` đánh ⚠️ nếu log có code changes, ✅ nếu không
- Link tới file log trong `modules/<module>/`
- Khi file lớn (>200 logs), archive sang `TIMELINE_ARCHIVE_YYYY.md` và giữ TIMELINE.md cho 4 tuần gần nhất
