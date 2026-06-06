# HỆ THỐNG QUẢN LÝ CƠ SỞ KINH DOANH SPA

> Hệ thống quản lý toàn diện hoạt động Spa. Bao gồm đặt lịch, tiếp nhận, thanh toán, kho vật liệu, nhân sự và báo cáo.

## Liên kết repository

| # | Loại repo | Đường dẫn |
|---|---|---|
| 1 | Repo parent hiện tại | [RIPT1307-3-KTHP](https://github.com/Khangvu345/RIPT1307-3-KTHP) |
| 2 | Repo child frontend | [SPA_WEB_FRONTEND](https://github.com/congpx-udu/SPA_WEB_FRONTEND) |
 
---
 
## Tổng quan dự án
 
| Thông tin | Chi tiết |
|---|---|
| **Tên dự án** | Hệ thống quản lý cơ sở kinh doanh Spa |
| **Loại** | Web Application — Monolith |
| **Môn học** | Thực hành lập trình web |
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
 
Do frontend và backend dùng 2 phiên bản Node.js khác nhau, nên dùng `fnm` để chuyển version theo từng thư mục:

- **Frontend**: Node.js 16 LTS, React 17 + Umi, dùng Yarn classic
- **Backend**: Node.js 24 LTS, NestJS, dùng npm

### 1. Cài fnm và Node.js

```powershell
# Windows PowerShell
winget install Schniz.fnm
```

Đóng và mở lại terminal, sau đó cài 2 version Node.js cần dùng:

```powershell
fnm install 16
fnm install 24
fnm list
```

Nếu PowerShell chưa tự nhận `fnm`, thêm dòng sau vào `$PROFILE`, rồi mở lại terminal:

```powershell
fnm env --use-on-cd | Out-String | Invoke-Expression
```

### 2. Chạy backend

```powershell
cd backend
fnm use 24
npm install
Copy-Item .env.example .env
npm run start:dev
```

Backend mặc định chạy tại:

- REST API: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api-docs`
- Swagger JSON: `http://localhost:3000/api-docs-json`

Nếu cần tạo tài khoản admin demo:

```powershell
npm run seed:admin
```

### 3. Chạy frontend

Mở một terminal khác:

```powershell
cd frontend
fnm use 16
npm install --global yarn
yarn install
Copy-Item .env.example .env
```

Trong `frontend/.env`, chỉnh URL backend:

```env
APP_CONFIG_API_URL=http://localhost:3000/api/v1
```

Chạy frontend ở port `8000` để khớp `CORS_ORIGIN` mặc định của backend và tránh trùng port `3000`:

```powershell
$env:PORT=8000
yarn start
```

Truy cập frontend tại `http://localhost:8000`.
 
---
 ## Tài liệu


| Tài liệu                          | Đường dẫn                             |
| --------------------------------- | ------------------------------------- |
| Hướng dẫn setup & Git workflow    | [`CONTRIBUTING.md`](./CONTRIBUTING.md)|
| Coding convention                 | [`CODING_CONVENTION.md`](./CODING_CONVENTION.md) |

