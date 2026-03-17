# Spa Management System
 
> Hệ thống quản lý toàn diện hoạt động Spa. Bao gồm đặt lịch, tiếp nhận, thanh toán, kho vật liệu, nhân sự và báo cáo.
 
---
 
## Tổng quan dự án
 
| Thông tin | Chi tiết |
|---|---|
| **Tên dự án** | Spa Management System |
| **Loại** | Web Application — Monolith |
| **Môn học** | Lập trình Web (Cuối kỳ) |
| **Stack** | NestJS · React · MongoDB · TypeScript |
 
### Mục tiêu hệ thống
 
Quản lý toàn bộ hoạt động của Spa, tập trung vào 4 mảng chính:
 
- **Phục vụ khách hàng** — Đặt lịch, check-in, phân công nhân viên
- **Thanh toán** — Hóa đơn chi tiết dịch vụ + vật liệu
- **Kho vật liệu** — Nhập hàng, quản lý tồn kho, nhà cung cấp
- **Báo cáo & Nhân sự** — Thống kê doanh thu, lương nhân viên
 
---
 
##  Kiến trúc Repo
 
Repo này là **repo cha** sử dụng **Git Submodules**. Mỗi thành phần là một repo độc lập.
 
```
spa-management/                  ← Repo cha (repo này)
├── backend/                     ← Submodule: spa-management-backend
├── frontend/                    ← Submodule: spa-management-frontend
└── documents/                   ← Submodule: spa-management-docs 
```
 

 
## Modules hệ thống
 
| Module | Mô tả | Actor |
|---|---|---|
| **Landing Page** | Giới thiệu spa, xem dịch vụ, đặt lịch online | Khách hàng |
| **Tiếp nhận** | Check-in, phân công nhân viên, quản lý hàng đợi | Lễ tân |
| **Thanh toán** | Tạo hóa đơn, tính tiền dịch vụ + vật liệu, in bill | Thu ngân |
| **Kho vật liệu** | Nhập hàng, quản lý nhà cung cấp, theo dõi tồn kho | Thủ kho |
| **Báo cáo** | Thống kê doanh thu theo khoảng thời gian | Quản lý |
| **Nhân viên** | Hồ sơ, phân quyền dịch vụ, tính lương hoa hồng | Quản lý |
 
---
 
##  Bắt đầu nhanh
 
### Yêu cầu hệ thống
 
- Node.js 
- Docker & Docker Compose
- Git (hỗ trợ submodules)
 
### Clone repo đầy đủ (bao gồm submodules)
 
```bash
# Clone repo cha + tất cả submodules cùng lúc
git clone --recurse-submodules <url>
 
# Hoặc nếu đã clone rồi mà chưa có submodules
git submodule update --init --recursive
```
 
### Cập nhật submodule lên commit mới nhất
 
```bash
# Cập nhật tất cả submodules
git submodule update --remote --merge
 
# Cập nhật 1 submodule cụ thể
git submodule update --remote <backend>
```
 
### Chạy toàn bộ hệ thống (Docker)
 
```bash

```
 
| Service | URL |
|---|---|
| Frontend | http://localhost: |
| Backend API | http://localhost: |
| MongoDB | mongodb://localhost: |
 
---
 

