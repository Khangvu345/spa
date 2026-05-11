# Workflow — Quy trình thao tác hàng ngày

File này mô tả 4 quy trình chính khi sử dụng `ai-docs/` trong daily work. Đọc README.md trước nếu chưa nắm mô hình 2 tầng.

---

## Workflow A — Bắt đầu 1 issue mới

**Trigger:** Dev nhận issue, paste vào chat AI cùng business context.

**Bước:**

1. **Dev paste vào chat:**
   ```
   "Làm issue #17. [paste full issue text].
   Context: <business context bổ sung, lưu ý đặc biệt>"
   ```

2. **AI tạo `ai-docs/issues/<id>.md`** từ template `_templates/ISSUE.md`:
   - Frontmatter: `id`, `title`, `module`, `paste_date`, `pasted_by`, `status: in-progress`
   - Lưu **nguyên văn** issue text vào section "Nội dung Issue"
   - Lưu context dev vào section "Context bổ sung"

3. **AI đọc rule + state liên quan** trước khi code:
   - `rules/skills/spa-backend-module-pattern.md` (convention coding)
   - `rules/context/plan.md` (project context)
   - `modules/<module>/README.md` (module hiện trạng — nếu có)
   - Log gần nhất trong `modules/<module>/` (nếu có)

4. **AI code** theo skill `spa-backend-module-pattern`.

5. **AI update `STATUS.md`** — set row của dev:
   ```
   | <dev> | [#17](issues/17.md) | <module> | <link active log> | 🟡 đang code | <date> |
   ```

---

## Workflow B — Đóng session làm việc

**Trigger:** Dev kết thúc 1 phiên code (giữa session hoặc cuối ngày).

**Bước:**

1. **Tạo log mới** trong `modules/<module>/YYYY-MM-DD_NNN_<dev>.md` từ template `_templates/LOG_ENTRY.md`:
   - Điền frontmatter: dev, datetime, module, session #, link issue, link log trước
   - Điền các section: đã làm được, thay đổi code, lý do, vướng mắc, bước tiếp theo
   - Đánh dấu trạng thái code changes: ✅ hoặc ⚠️

2. **Nếu ⚠️ (có code changes):** cập nhật `modules/<module>/README.md` mục **"Hiện trạng (Current Snapshot)"**:
   - Thêm/sửa endpoints đã implement
   - Update schema fields chính
   - Ghi quyết định kỹ thuật mới (nếu có)
   - Cập nhật danh sách Pending

3. **Thêm row vào `TIMELINE.md`:**
   ```
   | <date> | <NNN> | <dev> | <module> | [#issue] | <tóm tắt> | ⚠️/✅ | [link log] |
   ```

4. **Update `STATUS.md`** — đổi trạng thái row:
   - Nếu blocker: 🔴 blocked (ghi rõ blocker ở log)
   - **Xong task** (PR mở hoặc merge xong): AI không tự detect (xảy ra trên GitHub). Dev báo AI "đã xong issue X" → AI clear row. Nếu merge xong: update `issues/<id>.md` status: `done`. Hoặc dev tự edit.

5. **Update `issues/<id>.md`** — thêm dòng vào mục "Logs liên quan":
   ```
   - <YYYY-MM-DD>_<NNN>_<dev> — <tóm tắt 1 dòng>
   ```

---

## Workflow C — Cross-dev pull (dev B tiếp việc dev A)

**Trigger:** Dev B `git pull` lấy code của dev A, mở session mới làm tiếp.

**Khi nào áp dụng:** Log trước (của dev A) đánh dấu ⚠️ **VÀ** session mới khác dev.

**Bước (thêm vào Workflow B):**

- Trong log mới, **bắt buộc điền** section **"Code changes từ log trước"** với format:
  ```
  - `<sha>` <type>(<scope>): <commit message>
  - `<sha>` ...
  - (Files chính: `path/...`, `path/...`)
  ```
- **KHÔNG viết prose** mô tả lại các thay đổi — git SHA + 1 dòng/commit là đủ. AI muốn chi tiết sẽ chạy `git show <sha>`.

**Khi không áp dụng:** Cùng dev cùng máy, không có cross-pull → section này điền `Không có` hoặc bỏ qua, vì git history cùng máy đã đủ.

---

## Workflow D — Review PR

**Trigger:** Dev mở PR, reviewer (lead/teammate) review.

**Bước:**

1. **Reviewer mở `ai-docs/issues/<id>.md`** — đọc issue snapshot để biết yêu cầu gốc.

2. **Reviewer load skill `spa-backend-pr-review`** từ `rules/skills/` — checklist 10 mục.

3. **Reviewer chạy local test trước khi đọc code** (theo skill bước 2):
   - `npm run build`
   - `npm run start:dev` + verify Swagger
   - Smoke test 5 endpoint cơ bản qua Postman
   - Nếu fail → block merge ngay, không đọc tiếp

4. **Reviewer đi qua checklist 10 mục** trong skill — comment trên GitHub theo 3 mức:
   - ✅ Pass
   - ⚠️ Suggest (không block)
   - ❌ Block (phải sửa)

5. **Sau merge:**
   - Author update `issues/<id>.md` status: `done`
   - Author clear row trong `STATUS.md`

---

## Convention reminders

### Commit format
```
#<issue-id> <type>(<scope>): <short message>

[optional body]
```
Type: `feat | fix | refactor | docs | test | chore | style`

### Branch name
```
feature/<issue-id>-<short-desc>
fix/<issue-id>-<short-desc>
```

### Quy tắc bất biến
1. **Không edit/xóa log cũ** — chỉ thêm log mới
2. **Issue lưu nguyên văn** — không tóm tắt khi paste vào `issues/<id>.md`
3. **Module README cập nhật khi ⚠️** — không cập nhật ở mỗi log nhỏ
4. **Skills là source of truth cho code convention** — không lặp lại convention trong log

---

## Khi có conflict giữa Issue và rule layer

- **Issue luôn thắng** — Issue là yêu cầu cụ thể, rule là default
- Ghi rõ sự khác biệt trong log mục "Lý do thay đổi" và trong PR description
- Nếu rule thật sự sai → mở issue riêng để update rule, đừng silent override
