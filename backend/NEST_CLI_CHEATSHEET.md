## NestJS CLI Cheatsheet

Nest CLI cung cấp các lệnh `generate` (viết tắt là `g`) để tạo tự động các file chuẩn kiến trúc.

| Lệnh đầy đủ | Lệnh viết tắt | Chức năng |
|---|---|---|
| `nest new <tên-app>` | (Không có) | Khởi tạo toàn bộ dự án NestJS mới. |
| `nest generate module <tên>` | `nest g mo <tên>` | Tạo một Module mới và tự động import vào `app.module.ts`. |
| `nest generate controller <tên>`| `nest g co <tên>` | Tạo Controller (kèm file test) và khai báo vào module tương ứng. |
| `nest generate service <tên>` | `nest g s <tên>` | Tạo Service (kèm file test) và khai báo vào module tương ứng. |
| `nest generate resource <tên>`| `nest g res <tên>` | **🌟 Lệnh mạnh nhất:** Tạo sẵn toàn bộ Module, Controller, Service, DTO, Entities cho một luồng CRUD (Create, Read, Update, Delete). |
| `nest generate guard <tên>` | `nest g gu <tên>` | Tạo một Guard (thường dùng cho Authentication/Authorization). |
| `nest generate filter <tên>` | `nest g f <tên>` | Tạo một Exception Filter để bắt lỗi. |

**💡 Mẹo tạo file vào đúng thư mục:**
Ví dụ, để tạo module `booking` nằm gọn trong thư mục `src/modules/booking`, bạn chạy lệnh:
`nest g mo modules/booking`

---