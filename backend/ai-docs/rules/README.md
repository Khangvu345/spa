# Rules — Static knowledge layer

Folder này chứa **convention/rule/context** mà AI dựa vào để code đúng. Đối lập với dynamic state (issues/, modules/, STATUS.md) — rules ít thay đổi, được lead duy trì.

---

## Khi nào AI đọc gì

| AI cần biết | Đọc |
|---|---|
| Code module mới như thế nào (4 DTO, schema mapping, mapToResponse, …) | `skills/spa-backend-module-pattern.md` |
| Review PR theo checklist nào | `skills/spa-backend-pr-review.md` |
| Project làm gì, business goal, stakeholders | `context/plan.md` |

---

## Folder map

```
rules/
├── README.md                            ← bạn đang đọc
├── skills/                              ← skill definitions (frontmatter + body)
│   ├── spa-backend-module-pattern.md    ← scaffold/implement module mới
│   └── spa-backend-pr-review.md         ← checklist review PR
└── context/
    └── plan.md                          ← project executive summary + scope
```

---

## Khác biệt skill vs context

- **Skill** = "cách làm" — quy trình kỹ thuật, code template, checklist. Dùng cho task cụ thể.
- **Context** = "tại sao" — business goal, stakeholders, scope. Dùng để hiểu motivation đằng sau yêu cầu.

AI khi nhận issue mới: load skill phù hợp + đọc context để hiểu nghiệp vụ.

---

## Quy tắc maintain

- **Lead duy trì rules/** — không phải dev nào cũng được sửa
- Khi convention thay đổi → update skill file, ghi rõ ngày update + lý do trong commit message
- Khi dự án thay đổi scope → update `context/plan.md`
- KHÔNG copy/paste convention từ rules vào logs — log chỉ ghi việc đã làm, không ghi rule
