# Timeline — Master log index

> Tất cả logs, **mới nhất trên đầu**. AI dùng để tra lịch sử team theo thời gian.
> STATUS.md = hiện tại; TIMELINE.md = lịch sử.

---

## Logs

| Ngày | # | Dev | Module | Issue | Tóm tắt | Code? | Link |
|---|---|---|---|---|---|---|---|
| 2026-05-19 | 001 | Khanh | service-material-bom | [#18](issues/18.md) | Scaffold module BOM CRUD + seed 15 entries định mức cho 6 dịch vụ | ⚠️ | [log](modules/service-material-bom/2026-05-19_001_Khanh.md) |
| 2026-05-17 | 001 | Khang | auth/employee | [#08](issues/08.md) | Refactor role vận hành về OPERATOR + seed staff demo | ⚠️ | [log](modules/auth/2026-05-17_001_Khang.md) |
| 2026-05-16 | 001 | Khang | employee/employee | [#04](issues/04.md) | Triển khai quản lý tài khoản issue #04 | ⚠️ | [log](modules/employee/employee/2026-05-16_001_Khang.md) |
| 2026-05-14 | 002 | Khanh | material | [#07](issues/07.md) | Scaffold module Material CRUD + seed 15 vật liệu | ⚠️ | [log](modules/material/2026-05-14_002_Khanh.md) |
| 2026-05-14 | 001 | Khang | supplier | [#06](issues/06.md) | Scaffold module Supplier CRUD + seed 5 NCC | ⚠️ | [log](modules/supplier/2026-05-14_001_Khanh.md) |
| 2026-05-13 | 002 | Khanh | service | [#05](issues/05.md) | Fix GET /services trả rỗng do filter snake_case không khớp DB camelCase | ⚠️ | [log](modules/service/2026-05-13_002_Khanh.md) |
| 2026-05-13 | 001 | Khanh | service | [#05](issues/05.md) | Scaffold module Service CRUD + seed 6 dịch vụ | ⚠️ | [log](modules/service/2026-05-13_001_Khanh.md) |
| 2026-05-13 | 001 | Khang | employee/employee | [#03](issues/03.md) | Triển khai CRUD nhân viên trên Staff schema | ⚠️ | [log](modules/employee/employee/2026-05-13_001_Khang.md) |
| 2026-05-12 | 001 | Khang | auth | [#02](issues/02.md) | Implement auth core JWT/RBAC + Staff schema | ⚠️ | [log](modules/auth/2026-05-12_001_Khang.md) |
| 2026-05-12 | 001 | Khang | auth | [#02](issues/02.md) | Triển khai auth core JWT/RBAC và Staff schema | ⚠️ | [log](modules/auth/2026-05-12_001_Khang.md) |

---

## Statistics

> Cập nhật thủ công hoặc bỏ qua nếu không cần.

- **Tổng logs:** 10
- **Per-dev:**
  - Khang: 6 logs
  - Khanh: 4 logs
- **Per-module:**
  - auth/employee: 1 log
  - auth: 2 logs
  - employee/employee: 2 logs
  - material: 1 log
  - service: 2 logs
  - service-material-bom: 1 log
  - supplier: 1 log

---

## Quy tắc

- Mới nhất trên đầu (newest first)
- Mỗi log = 1 row
- Cột `Code?` đánh ⚠️ nếu log có code changes, ✅ nếu không
- Link tới file log trong `modules/<module>/`
- Khi file lớn (>200 logs), archive sang `TIMELINE_ARCHIVE_YYYY.md` và giữ TIMELINE.md cho 4 tuần gần nhất
