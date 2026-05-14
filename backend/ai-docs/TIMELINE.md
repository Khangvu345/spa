# Timeline — Master log index

> Tất cả logs, **mới nhất trên đầu**. AI dùng để tra lịch sử team theo thời gian.
> STATUS.md = hiện tại; TIMELINE.md = lịch sử.

---

## Logs

| Ngày | # | Dev | Module | Issue | Tóm tắt | Code? | Link |
|---|---|---|---|---|---|---|---|
| 2026-05-13 | 001 | Khang | employee/employee | [#03](issues/03.md) | Implement Employee CRUD trên Staff schema | ⚠️ | [log](modules/employee/employee/2026-05-13_001_Khang.md) |
| 2026-05-12 | 001 | Khang | auth | [#02](issues/02.md) | Implement auth core JWT/RBAC + Staff schema | ⚠️ | [log](modules/auth/2026-05-12_001_Khang.md) |
|---|---|---|---|---|---|---|---|

---

## Statistics

> Cập nhật thủ công hoặc bỏ qua nếu không cần.

- **Tổng logs:** 2
- **Per-dev:**
  - Khang: 2 logs
- **Per-module:**
  - auth: 1 log
  - employee/employee: 1 log

---

## Quy tắc

- Mới nhất trên đầu (newest first)
- Mỗi log = 1 row
- Cột `Code?` đánh ⚠️ nếu log có code changes, ✅ nếu không
- Link tới file log trong `modules/<module>/`
- Khi file lớn (>200 logs), archive sang `TIMELINE_ARCHIVE_YYYY.md` và giữ TIMELINE.md cho 4 tuần gần nhất
