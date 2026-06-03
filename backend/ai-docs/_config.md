# Git Identity Mapping

Mapping git `user.name` (commit author) sang display name dùng trong logs/STATUS.

| Git username | Dev name | Email |
|---|---|---|
| khanhbpn12 | Khanh | ---|
|  Khangvu345  | Khang |--- |

---

## Cách dùng

- AI khi tạo log/STATUS row dùng `Dev name` (không dùng git username thô)
- Khi reviewer cần biết "ai commit này" → tra `git log --format='%an'` rồi map sang Dev name qua bảng này
- Nếu dev mới join team → thêm 1 row, không xóa row cũ

## Lưu ý

- File này KHÔNG commit thông tin nhạy cảm (password, key)
- Nếu email khác `git config user.email` → ghi rõ cả hai
