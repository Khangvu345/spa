# ai-docs — AI Traceability Layer cho Team Backend

Folder này là **bộ context cho AI** khi team code cùng AI orchestration. Mục tiêu: AI nhận issue mới → đọc folder này → biết module hiện trạng + vừa thay đổi gì + convention nào áp dụng → code không miss info, không hallucinate.

> Đây KHÔNG phải project documentation truyền thống. Đây là **state layer** cho AI consume.

---

## Mục đích

Khi 1 dev paste issue vào chat AI để bắt đầu code, AI cần biết 3 thứ:

1. **Convention/rule nào áp dụng?** → đọc `rules/`
2. **Module này hiện trạng ra sao?** → đọc `modules/<module>/README.md`
3. **Vừa thay đổi gì có thể ảnh hưởng?** → đọc log gần nhất trong `modules/<module>/`

Folder này tổ chức để 3 câu hỏi đó được trả lời nhanh, không cần replay toàn bộ lịch sử.

---

## Mô hình 2 tầng

| Tầng | Tốc độ thay đổi | Vai trò | Thư mục |
|---|---|---|---|
| **Rule layer** (static) | Hiếm khi đổi | Convention, skill, project context — AI dựa vào để code đúng | `rules/` |
| **Dynamic state layer** (high-change) | Mỗi session | Issue snapshot, log, module state, active assignments — AI dựa vào để biết hiện tại | `issues/`, `modules/`, `STATUS.md`, `TIMELINE.md` |

Rule = "phải code thế nào". State = "đã/đang code đến đâu".

---

## Folder map

```
ai-docs/
├── README.md          ← bạn đang đọc
├── WORKFLOW.md        ← quy trình thao tác hàng ngày (4 workflows)
├── _config.md         ← mapping git username → dev name
│
├── rules/             ← RULE LAYER
│   ├── README.md      ← index của rules/
│   ├── skills/        ← skill definitions cho AI (module pattern + PR review)
│   └── context/
│       └── plan.md    ← project context 
│
├── _templates/        ← templates cho file dynamic state
│   ├── LOG_ENTRY.md
│   ├── MODULE_README.md
│   └── ISSUE.md
│
├── STATUS.md          ← bảng "team đang làm gì RIGHT NOW" (1 row/dev)
├── TIMELINE.md        ← index toàn bộ logs (mới nhất trên đầu)
│
├── issues/            ← snapshot issue paste từ chat (lưu nguyên văn)
│   └── <id>.md
│
└── modules/           ← per-module: README sống + logs theo session
    └── <module>/
        ├── README.md  ← living state: endpoints, schema, decisions, pending
        └── YYYY-MM-DD_NNN_<dev>.md
```

---

## Để bắt đầu dùng cho 1 dự án mới

5 bước setup:

1. **Fill `_config.md`** — map git username của từng dev sang display name
2. **Fill `rules/context/plan.md`** — paste/viết project executive summary, business need, scope, stakeholders
3. **Verify `rules/skills/`** — đảm bảo các skill file (module pattern, PR review) đã có content phù hợp dự án
4. **Tạo module folder đầu tiên** — `mkdir modules/<first-module>`, tạo `README.md` từ template `_templates/MODULE_README.md`
5. **Bắt đầu issue đầu tiên** — dev paste issue vào chat, AI làm theo `WORKFLOW.md` Workflow A

---

## Daily operations

Xem `WORKFLOW.md` cho 4 quy trình chính:
- **A** — Bắt đầu 1 issue mới
- **B** — Đóng session làm việc
- **C** — Cross-dev pull (dev B tiếp việc dev A)
- **D** — Review PR

---

## Nguyên tắc nền tảng

1. **Không edit/xóa log cũ** — chỉ thêm log mới. Log = nhật ký bất biến.
2. **Module README là living state** — cập nhật khi đóng session ⚠️. Đây là source of truth cho "module hiện trạng".
3. **Issue lưu nguyên văn** — khi dev paste issue, AI lưu vào `issues/<id>.md` không tóm tắt, không edit.
4. **STATUS.md = hiện tại; TIMELINE.md = lịch sử** — không lẫn vai trò.
5. **Rule layer không trùng dynamic** — convention ở `rules/`, không nhắc lại trong logs.

---

## Đối tượng đọc folder này

- **Dev mới gia nhập team** → đọc README + WORKFLOW + rules/, có thể bắt đầu code.
- **AI session mới** → đọc rules/skills/ + module README liên quan + log gần nhất + issue đang xử lý.
- **Reviewer/Outsider** → đọc README để hiểu mô hình, sau đó dùng skill `spa-backend-pr-review` để review.
