# Spa Management System
 
> Hệ thống quản lý toàn diện hoạt động Spa. Bao gồm đặt lịch, tiếp nhận, thanh toán, kho vật liệu, nhân sự và báo cáo.
 
---
 
## Tổng quan dự án
 
| Thông tin | Chi tiết |
|---|---|
| **Tên dự án** | Spa Management System |
| **Loại** | Web Application — Monolith |
| **Môn học** | Lập trình Web (Cuối kỳ) |
| **Stack** | NestJS · React (base-web-umi) · MongoDB · TypeScript |
 
### Mục tiêu hệ thống
 
Quản lý toàn bộ hoạt động của Spa, tập trung vào 4 mảng chính:
 
- **Phục vụ khách hàng** — Đặt lịch, check-in, phân công nhân viên
- **Thanh toán** — Hóa đơn chi tiết dịch vụ + vật liệu
- **Kho vật liệu** — Nhập hàng, quản lý tồn kho, nhà cung cấp
- **Báo cáo & Nhân sự** — Thống kê doanh thu, lương nhân viên
 
---
### Môi trường runtime

| Thành phần  | Node.js     | TypeScript | Framework            |
| ----------- | ----------- | ---------- | -------------------- |
| **Backend** | 24 LTS      | 5.x        | NestJS               |
| **Frontend**| 16 LTS      | 4.x        | Umi |
 
##  Kiến trúc Repo
 
Repo này là **repo cha** sử dụng **Git Subtree**.  
Code của từng thành phần được nhúng trực tiếp vào repo cha (không phải pointer như Submodule).
```
spa-management/              ← Repo cha (repo này)
├── backend/                 ← NestJS 
├── frontend/                ← Subtree (Repo Child riêng duy nhất) (base-Umi)
└── documents/               ← Tài liệu 
```

### Tại sao frontend tách thành Git Subtree riêng?

Frontend sử dụng **base-web-umi** — một template legacy với môi trường:
- Node.js 16
- TypeScript 4.x
- Umi  + Ant Design Pro

Backend sử dụng môi trường hiện đại hơn:
- Node.js >= 24
- TypeScript 5.x
- NestJS

Hai môi trường **không tương thích để chạy chung**, nên frontend được
tách thành repo riêng và nhúng vào repo cha qua Git Subtree.  
Backend và Documents nằm trực tiếp trong repo cha, commit/push bình thường.

---

 
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
 

### Chạy bằng Docker (khuyến nghị)
```bash
git clone  spa-management
cd spa-management

cp .env.example .env
docker compose up -d
```
| Service | URL |
|---|---|
| Frontend | http://localhost: |
| Backend API | http://localhost: |
| Swagger UI | http://localhost:.../api
| MongoDB | mongodb://localhost: |
 
---
 ## Tài liệu


| Tài liệu                          | Đường dẫn                             |
| --------------------------------- | ------------------------------------- |
| Hướng dẫn setup & Git workflow    | [`CONTRIBUTING.md`](./CONTRIBUTING.md)|
| Coding convention                 | [`CODING_CONVENTION.md`](./CODING_CONVENTION.md) |

