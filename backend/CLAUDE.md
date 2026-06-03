# Repo guide for Claude Code

Backend project (NestJS + MongoDB). Dùng AI orchestration với team dev.

---

## AI traceability layer — đọc trước khi làm task

Repo này dùng `ai-docs/` làm context layer cho AI. **Trước khi code, đọc:**

1. [`ai-docs/README.md`](ai-docs/README.md) — mô hình 2 tầng (rule + dynamic state)
2. [`ai-docs/WORKFLOW.md`](ai-docs/WORKFLOW.md) — 4 quy trình A/B/C/D

---

## Khi dev paste issue mới (Workflow A)

1. Tạo `ai-docs/issues/<id>.md` từ template [`ai-docs/_templates/ISSUE.md`](ai-docs/_templates/ISSUE.md) — lưu **nguyên văn** issue text + context dev cung cấp
2. Load skill liên quan trong [`ai-docs/rules/skills/`](ai-docs/rules/skills/):
   - `spa-backend-module-pattern` — khi viết code module mới
   - `spa-backend-pr-review` — khi review PR / audit module
3. Đọc `ai-docs/modules/<module>/README.md` (mục "Hiện trạng") để biết module đang ở đâu
4. Đọc log gần nhất trong `ai-docs/modules/<module>/` để biết vừa thay đổi gì
5. Code theo convention skill
6. Update [`ai-docs/STATUS.md`](ai-docs/STATUS.md) row của dev (issue, module, log link, 🟡)

---

## Khi đóng session có code changes (Workflow B)

1. Tạo log mới `ai-docs/modules/<module>/YYYY-MM-DD_NNN_<dev>.md` từ [`ai-docs/_templates/LOG_ENTRY.md`](ai-docs/_templates/LOG_ENTRY.md)
2. Nếu ⚠️: update `ai-docs/modules/<module>/README.md` mục "Hiện trạng" (endpoints, schema, decisions, pending)
3. Thêm row vào [`ai-docs/TIMELINE.md`](ai-docs/TIMELINE.md)
4. Update STATUS.md emoji (🔴 nếu blocked). Khi xong task (PR mở / merge) → dev báo AI hoặc tự clear row.
5. Update `ai-docs/issues/<id>.md` mục "Logs liên quan"

→ **Dev BẮT BUỘC review** các file ai-docs vừa update trước khi commit.

---

## Cross-dev pull / Review PR
Theo Workflow C / D trong `ai-docs/WORKFLOW.md`.

---

## Quy ước cốt lõi

- **"Code changes từ log trước"**: chỉ điền khi log trước ⚠️ VÀ khác dev. Format: git SHA + 1 dòng/commit. **KHÔNG** viết prose mô tả lại.
- **Module README** chỉ update mục "Hiện trạng" khi đóng session ⚠️ (không update mỗi log nhỏ).
- **Issue lưu nguyên văn** — không tóm tắt, không dịch khi paste vào `issues/<id>.md`.
- **Logs bất biến** — không edit/xóa log cũ, chỉ thêm log mới.
- **STATUS.md = hiện tại; TIMELINE.md = lịch sử** — không lẫn vai trò.

---

## Git / PR rules

- **Commit hộ dev** được phép khi dev yêu cầu, nhưng:
  - **KHÔNG** thêm `Co-Authored-By: Claude <...>` hoặc bất kỳ trailer nào attribute AI/Claude vào commit message
  - **KHÔNG** thêm dòng "🤖 Generated with Claude Code" hoặc tương tự
  - Commit message thuần format: `#<issue> <type>(<scope>): <msg>`
- **KHÔNG tạo PR hộ** — dev tự mở PR trên GitHub/UI. AI chỉ commit và (nếu được yêu cầu) push branch.
- **Push / rebase / force-push**: chỉ làm khi dev explicit yêu cầu, không tự chủ động.

---

## Khi không chắc

| Không rõ về | Đọc |
|---|---|
| Convention coding | `ai-docs/rules/skills/spa-backend-module-pattern.md` |
| Checklist review PR | `ai-docs/rules/skills/spa-backend-pr-review.md` |
| Project context / nghiệp vụ (tham khảo, có thể outdated) | `ai-docs/rules/context/plan.md` |
| Hiện trạng module X | `ai-docs/modules/X/README.md` |
| Yêu cầu issue #N | `ai-docs/issues/N.md` |
| Team đang làm gì | `ai-docs/STATUS.md` |
| Lịch sử thay đổi | `ai-docs/TIMELINE.md` |

→ Vẫn không rõ sau khi đọc → **hỏi dev**, không suy diễn business logic.

---

## Folder `docs/` (legacy)

Không dùng — test data cũ. Mọi context lấy từ `ai-docs/`.

---

## Mapping git username → dev name
Xem [`ai-docs/_config.md`](ai-docs/_config.md). Khi tạo log/STATUS row, dùng Dev name (không dùng git username thô).
