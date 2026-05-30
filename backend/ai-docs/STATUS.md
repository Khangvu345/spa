# Active Assignments

> Bảng việc-đang-mở của team. **1 row/dev**. AI mở conversation mới đọc đây để biết hiện tại.
> STATUS.md = hiện tại; TIMELINE.md = lịch sử. Không lẫn vai trò.

---

| Dev | Issue | Module | Active Log | Trạng thái | Bắt đầu |
|---|---|---|---|---|---|
| Khang | [#16](issues/16.md) | service-order | [log](modules/service-order/2026-05-21_001_Khang.md) | 🟡 | 2026-05-21 |
| Khang | [#14](issues/14.md) | customer | [log](modules/customer/2026-05-21_001_Khang.md) | 🟡 | 2026-05-21 |
| Khanh | [#05](issues/05.md) | service | [log](modules/service/2026-05-13_002_Khanh.md) | 🟡 | 2026-05-13 |
| Khanh | [#06](issues/06.md) | supplier | [log](modules/supplier/2026-05-14_001_Khanh.md) | 🟡 | 2026-05-14 |
| Khanh | [#07](issues/07.md) | material | [log](modules/material/2026-05-14_002_Khanh.md) | 🟡 | 2026-05-14 |
| Khanh | [#18](issues/18.md) | service-material-bom | [log](modules/service-material-bom/2026-05-19_001_Khanh.md) | 🟡 | 2026-05-19 |
| Khanh | [#19](issues/19.md) | stock-ledger | [log](modules/stock-ledger/2026-05-23_001_Khanh.md) | 🟡 | 2026-05-23 |
| Khanh | [#20](issues/20.md) | invoice | [log](modules/invoice/2026-05-23_001_Khanh.md) | 🟡 | 2026-05-23 |
| Khanh | [#21](issues/issue-21-payroll.md) | payroll | [log](modules/payroll/2026-05-29_001_Khanh.md) | 🟡 | 2026-05-29 |
| --- | --- | ---| --- | ---| --- |
| Khang | [#15](issues/15.md) | staff-service-assignment | [log](modules/staff-service-assignment/2026-05-21_001_Khang.md) | 🟡 | 2026-05-21 |

---

## Trạng thái legend

- 🟡 **đang code** — dev đang làm việc
- 🔴 **blocked** — kẹt, ghi rõ blocker trong active log
- ⚪ **chưa nhận việc** — đang rảnh, chờ assign

> Không track "mở PR / chờ review / done" trong STATUS.md — các state đó xảy ra trên GitHub, AI không tự detect được. Khi dev xong task hoặc PR đã merge → clear row.

---

## Quy tắc cập nhật

- **Đầu session** (Workflow A bước 5): set row của dev — Issue link, Module, Active Log link, status 🟡, Bắt đầu = ngày hôm nay
- **Trong session**: gặp blocker → 🔴 (ghi rõ blocker ở log)
- **Xong task** (commit xong, mở PR, hoặc merge): dev báo AI "đã xong issue X" **hoặc** dev tự edit STATUS.md — clear row về `—`. Nếu issue đã merge: đổi `issues/<id>.md` status: `done`.
- KHÔNG xóa row dev (giữ row, chỉ reset values)
