# Project Plan — Spa Management System

> Project context cho AI hiểu nghiệp vụ trước khi code. Tham khảo, có thể outdated — Issue mới là source of truth khi conflict.

---

## Executive Summary

Hệ thống quản lý toàn diện hoạt động Spa (1 chi nhánh) cho đồ án cuối kỳ môn Lập trình Web. Bao gồm 4 mảng nghiệp vụ chính: phục vụ khách hàng (booking + check-in), thanh toán (CASH + VNPay sandbox), quản lý kho vật liệu (BOM + nhập/xuất + audit), nhân sự (CRUD + commission 3 lớp + payroll).

Stack: NestJS (Node 24, TS 5) + MongoDB Mongoose backend; Umi + Ant Design Pro (Node 16, TS 4) frontend.

---

## Business Need

- Spa hiện tại quản lý booking + kho + lương bằng Excel hoặc giấy → dễ sai số, khó tổng hợp, mất audit trail
- Cần hệ thống tự động:
  - Trừ kho khi khách thanh toán (BOM-based)
  - Tính commission 3 lớp (base + KPI + thâm niên) cho từng nhân viên mỗi tháng
  - Audit trail đầy đủ: nhập kho từ NCC, xuất kho theo invoice, giá vốn vs giá bán

---

## Business Objectives

1. **Centralization** — 1 nguồn dữ liệu duy nhất, không split giữa Excel/giấy/sổ
2. **Automation** — auto trừ kho khi invoice PAID, auto tính commission, auto generate payroll
3. **Audit trail** — `stock_receipts` (nhập), `stock_issues` (xuất), `payment_logs` (VNPay) đều immutable, truy vết được
4. **Snapshot integrity** — tài chính (commission, payroll, invoice services_snapshot) lưu giá trị tại thời điểm phát sinh, không reference live data → đổi giá sau không ảnh hưởng báo cáo cũ

---

## Project Scope

### In scope (giai đoạn này — đồ án)

1. **Authentication & Authorization** — JWT, RBAC 4 roles (ADMIN, RECEPTIONIST, CASHIER, STAFF)
2. **Employee management** — CRUD + reset password + lock account + 30-day delete rule
3. **Customer management** — không có account, định danh qua phone
4. **Service catalog** — services + BOM (service_materials)
5. **Booking** — 1 booking = 1 service, có buffer time, booking_group cho đặt liên tiếp
6. **Invoice & Payment** — DRAFT → PENDING_PAYMENT → PAID flow, CASH + VNPay sandbox
7. **Inventory** — materials, suppliers, stock_receipts (nhập), stock_issues (xuất tự động khi PAID)
8. **Commission & Payroll** — 3-layer commission, monthly payroll generate
9. **Operational costs** — tách biệt với BOM, tracking COGS vs OpEx
10. **OTP verification (phác thảo)** — Email + Console mock cho dev

### Out of scope (đồ án)

- Refresh token, 2FA, OAuth
- Forgot password tự động qua email (admin reset thủ công thay thế)
- Multi-branch (chỉ 1 chi nhánh)
- FIFO/LIFO inventory (dùng Latest Cost cho MVP)
- Real-time slot availability với WebSocket
- Email service tự động (SendGrid/SES)
- Audit log đầy đủ (ai làm gì)
- Cron jobs (admin manual trigger payroll, manual delete locked accounts)
- Test coverage 100% (unit + e2e tối thiểu cho critical paths)

---

## Stakeholders

| Vai trò | Mục đích sử dụng |
|---|---|
| **ADMIN (Quản lý)** | Quản lý duy nhất — bao gồm thủ kho + dashboard tài chính + CRUD employees + cấu hình hệ thống (KHÔNG tách role HR/Warehouse Keeper riêng) |
| **RECEPTIONIST (Lễ tân)** | Tiếp khách, tạo booking, check-in, quản lý hàng đợi |
| **CASHIER (Thu ngân)** | Tạo invoice, thu tiền CASH/VNPay, in bill |
| **STAFF (Nhân viên kỹ thuật)** | Làm dịch vụ massage, update status booking của mình |
| **Customer** | Đặt lịch online qua landing page (không có account, chỉ phone) |

---

## Team

| Vai trò | Người | Trách nhiệm |
|---|---|---|
| Lead BE + Project Leader | Khang  |  |
| BE | Khanh | |
| Lead FE | Công | Umi + Ant Design Pro, integrate API qua `umi openapi` |
| BA / Tester | Trang | Business analysis, test plan |

---

## Reference

- Business specification chi tiết: `business-specification.md` (folder documents) — v7
- ERD: `ERD.md` (folder documents) — v7
- Coding convention: `CODING_CONVENTION.md` (project root)
- Contributing guide: `CONTRIBUTING.md` (project root)
- README dự án: `README.md` (project root)

---

## Lưu ý quan trọng cho AI

- **Issue luôn thắng rule** — Issue là yêu cầu cụ thể, rule là default. Nếu mâu thuẫn → theo Issue, ghi rõ trong PR description
- **MongoDB Atlas free tier** dùng cho shared integration; **Docker Compose local** cho dev (cần bật replica set 1-node để dùng transaction)
- **Snapshot pattern là non-negotiable** cho financial data — commission_details, services_snapshot, materials_snapshot đều embed giá trị tại thời điểm phát sinh, không populate live
- **Vietnamese domain terms** trong code/log/UI: phiếu dịch vụ, lịch hẹn, hoa hồng, định mức, giao dịch kho