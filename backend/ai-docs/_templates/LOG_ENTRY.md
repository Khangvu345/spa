# Log Entry — [TIÊU ĐỀ NGẮN GỌN]

> **Hướng dẫn:** Copy file này vào `ai-docs/modules/<module>/YYYY-MM-DD_NNN_<dev>.md`.
> Điền đầy đủ tất cả trường. Xóa các dòng chú thích `>` sau khi điền xong.

---

## Thông tin chung

| Trường | Giá trị |
|---|---|
| **Người thực hiện** | <!-- dev name từ _config.md --> |
| **Thời điểm** | <!-- YYYY-MM-DD HH:MM, vd: 2026-05-12 09:30 --> |
| **Module** | <!-- vd: auth, booking, inventory --> |
| **Session #** | <!-- 001, 002... số thứ tự log trong ngày --> |
| **Liên quan Issue** | <!-- [#17](../../issues/17.md) hoặc "Không có" --> |
| **Liên quan log trước** | <!-- [link log trước] hoặc "Không có" --> |

---

## Code changes từ log trước

> **Bắt buộc** nếu log trước đánh dấu ⚠️ **VÀ** khác dev (cross-dev pull).
> **Optional** nếu cùng dev cùng máy.
> Format: SHA + 1 dòng/commit. KHÔNG viết prose mô tả lại.

- `<sha>` <type>(<scope>): <commit message>
- `<sha>` ...
- (Files chính: `path/file1`, `path/file2`)

---

## Những gì đã làm được

> Mô tả cụ thể từng việc đã hoàn thành trong session này. Checkbox.

- [x] ...
- [x] ...
- [ ] ... (chưa xong, push sang session sau)

---

## Thay đổi / Xóa trong code

> Liệt kê file/function thêm-sửa-xóa. Nếu không có code changes, ghi "Không có".

### Thêm mới
- `path/to/file.ts` — mô tả ngắn

### Sửa đổi
- `path/to/file.ts` — thay đổi gì

### Xóa
- `path/to/file.ts` — lý do xóa

---

## Lý do thay đổi

> Tại sao cần thay đổi như trên? Yêu cầu mới, bug fix, refactor, business rule mới, ...

-

---

## Vướng mắc / Quyết định kỹ thuật

> Vấn đề chưa giải quyết, quyết định kỹ thuật cần discuss, hoặc ghi chú quan trọng.
> Nếu là quyết định lớn (vd: chọn embed thay vì reference), ghi rõ lý do.

-

---

## Bước tiếp theo

> Việc cần làm session sau (cụ thể, có thể action được).

- [ ] ...
- [ ] ...

---

## Trạng thái code changes

> Đánh dấu CHỈ MỘT trong hai:

- [ ] ✅ Không có code changes — log tiếp theo không cần ghi lại
- [ ] ⚠️ Có code changes — log tiếp theo cần điền section "Code changes từ log trước" nếu khác dev
