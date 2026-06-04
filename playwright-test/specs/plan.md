# Test Plan E2E — Hệ thống quản lý Luna Spa

Tài liệu kế hoạch kiểm thử end-to-end cho toàn bộ module. Mỗi mục tương ứng một
file spec trong `tests/`. Trạng thái khởi đầu giả định: BE đã seed dữ liệu mẫu
(admin, operator, dịch vụ, NCC...), FE chạy tại `BASE_URL`.

**Tài khoản:**
- ADMIN — `admin@spa.local` / `Admin@123456`
- OPERATOR — `operator@spa.local` / `Staff@123456`

---

### 1. Auth — Đăng nhập (`tests/auth/login.spec.ts`)
1.1 Hiển thị đầy đủ form đăng nhập
1.2 Bỏ trống email/mật khẩu → cảnh báo "Thiếu thông tin"
1.3 Sai email/mật khẩu → cảnh báo "Sai email hoặc mật khẩu"
1.4 Nút con mắt bật/tắt hiển thị mật khẩu
1.5 ADMIN đăng nhập → `/admin/dashboard`
1.6 OPERATOR đăng nhập → `/le-tan`

### 2. Auth — Phân quyền (`tests/auth/access-control.spec.ts`)
2.1 Sidebar ADMIN hiển thị đủ menu quản trị
2.2 Sidebar ADMIN không có menu OPERATOR (Lễ tân/Thu ngân)
2.3 ADMIN vào `/le-tan` → 403 "Truy cập bị từ chối"
2.4 Sidebar OPERATOR hiển thị đủ menu vận hành
2.5 Sidebar OPERATOR không có menu ADMIN
2.6 OPERATOR vào `/bang-luong` → 403

### 3. Auth — Phiên (`tests/auth/session.spec.ts`)
3.1 Chưa đăng nhập vào route bảo vệ → đẩy về `/login`
3.2 Đã đăng nhập vào `/login` → tự về Dashboard
3.3 Đăng xuất từ sidebar (có modal xác nhận) → về `/login`

### 4. Auth — Đổi mật khẩu (`tests/auth/change-password.spec.ts`)
4.1 Mật khẩu mới < 8 ký tự → chặn
4.2 Xác nhận mật khẩu không khớp → chặn
*(Không submit thật để tránh đổi mật khẩu tài khoản test.)*

### 5. ADMIN — Dashboard (`tests/admin/dashboard.spec.ts`)
5.1 Hiển thị 4 KPI (Doanh thu, Phiếu DV, Đã hoàn thành, Khách hàng)
5.2 Hiển thị biểu đồ doanh thu, trạng thái, phiếu gần đây, dịch vụ phổ biến

### 6. ADMIN — Nhân viên (`tests/admin/employees.spec.ts`)
6.1 Cột bảng nhân viên
6.2 Lọc theo vai trò
6.3 Tìm kiếm không kết quả → rỗng
6.4 Validate bắt buộc khi tạo
6.5 Tạo nhân viên mới thành công
6.6 Xem hồ sơ nhân viên

### 7. Khách hàng (`tests/admin/customers.spec.ts`)
7.1 ADMIN không thấy nút Thêm (chỉ đọc)
7.2 ADMIN: cột bảng + lọc theo nguồn
7.3 ADMIN: tìm SĐT không tồn tại → rỗng
7.4 OPERATOR: validate bắt buộc khi tạo
7.5 OPERATOR: tạo khách hàng mới thành công

### 8. ADMIN — Dịch vụ (`tests/admin/services.spec.ts`)
8.1 Cột bảng dịch vụ
8.2 Lọc theo danh mục
8.3 Validate khi tạo thiếu mã/tên
8.4 Tạo dịch vụ mới thành công
8.5 Mở drawer Định mức nguyên liệu (BOM)
8.6 Mở modal Phân công chuyên viên

### 9. ADMIN — Bảng lương (`tests/admin/payroll.spec.ts`)
9.1 Cột bảng + bộ lọc kỳ/NV/trạng thái
9.2 Lọc theo trạng thái
9.3 Modal "Chốt lương" (xem trước) — nút Chốt khoá khi chưa chọn
9.4 Modal "Chốt hàng loạt"
9.5 Xem chi tiết phiếu lương *(nếu có dữ liệu)*

### 10. ADMIN — Nhà cung cấp (`tests/admin/suppliers.spec.ts`)
10.1 Cột bảng NCC
10.2 Lọc theo trạng thái
10.3 Validate bắt buộc khi tạo
10.4 Tạo NCC mới thành công

### 11. ADMIN — Vật liệu (`tests/admin/materials.spec.ts`)
11.1 Cột bảng vật liệu
11.2 Lọc theo loại
11.3 Validate bắt buộc khi tạo
11.4 Tạo vật liệu mới (chọn NCC đầu tiên)
11.5 Mở modal Điều chỉnh tồn kho
11.6 Mở drawer Xem chi tiết

### 12. ADMIN — Lịch sử kho (`tests/admin/stock-ledger.spec.ts`)
12.1 4 thẻ tổng hợp (Nhập/Xuất HĐ/Xuất tay/Điều chỉnh)
12.2 Cột bảng giao dịch
12.3 Lọc theo loại giao dịch

### 13. ADMIN — Kho vật liệu dashboard (`tests/admin/inventory-dashboard.spec.ts`)
13.1 4 KPI kho
13.2 Khối danh sách / cảnh báo / tiêu thụ
13.3 "Xem tất cả" → trang Vật liệu

### 14. Lịch hẹn (`tests/admin/bookings.spec.ts`)
14.1 Tab Lịch (react-big-calendar) hiển thị
14.2 Tab Danh sách: bảng + bộ lọc
14.3 Lọc theo trạng thái

### 15. OPERATOR — Lễ tân (`tests/operator/le-tan.spec.ts`)
15.1 4 KPI hôm nay
15.2 Card danh sách lịch hẹn hôm nay
15.3 Mở modal Tạo lịch hẹn

### 16. OPERATOR — Thu ngân (`tests/operator/thu-ngan.spec.ts`)
16.1 Cột bảng hoá đơn
16.2 Lọc theo trạng thái
16.3 Tìm mã HĐ không tồn tại → rỗng
16.4 Mở modal Tạo hoá đơn

### 17. Phiếu dịch vụ (`tests/operator/service-orders.spec.ts`)
17.1 OPERATOR: cột bảng
17.2 OPERATOR: lọc theo trạng thái
17.3 OPERATOR: mở modal Tạo phiếu
17.4 ADMIN: không thấy nút Tạo phiếu (chỉ xem)
17.5 ADMIN: menu thao tác chỉ cho "Xem phiếu dịch vụ"

---

**Ghi chú dữ liệu:** Các test "tạo mới" (nhân viên/khách hàng/dịch vụ/NCC/vật liệu)
ghi dữ liệu thật vào BE với tiền tố `E2E ...` + timestamp để tránh trùng. Nên chạy
trên DB dev/test, không chạy trên production.
