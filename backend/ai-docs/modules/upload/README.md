# Module: upload

> Tài liệu trạng thái sống — cập nhật khi đóng session.

---

## Mô tả

Module upload xử lý upload ảnh dịch vụ lên Cloudinary thông qua backend. FE gửi multipart file lên API nội bộ, backend validate file, stream buffer lên Cloudinary và trả URL để lưu vào `Service.imageUrl`.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/upload`
- **Đặc tả API:** `POST /upload/service-image`
- **Module liên quan:** `service`, `auth`

---

## Hiện trạng

### API đã cài đặt

| Method | Path | Mô tả |
|---|---|---|
| POST | `/upload/service-image` | ADMIN upload 1 ảnh dịch vụ lên Cloudinary, trả `{ url, publicId }` |

### Trường chính trong schema

- Không có collection riêng.
- `services.imageUrl: string` — URL ảnh Cloudinary, mặc định `''`, lưu qua `PATCH /services/:id`.

### Quyết định kỹ thuật quan trọng

- Upload và gán URL tách thành 2 bước: API upload trả URL, ServiceModule lưu `imageUrl`.
- Chỉ hỗ trợ `image/jpeg`, `image/png`, `image/webp`, tối đa 5MB.
- File dùng multer memory buffer, không lưu disk; buffer được stream lên `cloudinary.uploader.upload_stream`.
- Không xóa ảnh cũ trên Cloudinary khi đổi ảnh, đúng phạm vi MVP.

### Việc còn lại

- [ ] FE gắn Ant Design Upload vào màn quản trị dịch vụ và hiển thị ảnh ở landing/danh sách quản trị.
- [ ] Test tích hợp thủ công với thông tin xác thực Cloudinary thật trên môi trường dev.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-27_001_Khang.md](2026-05-27_001_Khang.md) | 2026-05-27 | Khang | Hoàn thành backend upload Cloudinary cho ảnh dịch vụ |
