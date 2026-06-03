# Project Plan - Spa Management System

> Project context cho AI hiểu nghiệp vụ trước khi code. Phạm vi nghiệp vụ được chốt theo file `Nhóm 3 chốt.pdf` ở cuối file này; Issue vẫn là source of truth cho chi tiết triển khai kỹ thuật trong phạm vi đó.

---

## Executive Summary

Hệ thống web quản lý hoạt động Spa cho đồ án cuối kỳ môn Lập trình Web. Khách hàng đặt lịch dịch vụ qua landing page với xác nhận OTP; nhân viên vận hành tiếp nhận khách, điều phối chuyên viên, lập phiếu dịch vụ và thanh toán; quản trị viên quản lý dịch vụ, kho vật liệu, nhân sự, hoa hồng và báo cáo doanh thu.

Stack: NestJS (Node 24, TS 5) + MongoDB Mongoose backend; Umi + Ant Design Pro (Node 16, TS 4) frontend.

---

## Business Need

- Spa cần một hệ thống tập trung để quản lý lịch hẹn, phục vụ khách, thanh toán, kho vật liệu và báo cáo thay cho Excel/giấy.
- Nhân viên vận hành cần tra cứu nhanh lịch hẹn, check-in khách, xử lý khách vãng lai, phân công chuyên viên và chuyển phiếu sang thanh toán.
- Quản trị viên cần quản lý dịch vụ, vật liệu tiêu hao, nhân viên, hoa hồng, cảnh báo tồn kho và báo cáo doanh thu.
- Khách hàng cần xem dịch vụ và đặt lịch trực tuyến bằng thông tin liên hệ, không cần tạo tài khoản; xác nhận lịch qua OTP email hoặc qua điện thoại từ nhân viên.

---

## Business Objectives

1. **Centralization** — 1 nguồn dữ liệu duy nhất cho dịch vụ, booking, khách hàng, phiếu dịch vụ, hóa đơn, kho và nhân viên.
2. **Operational Flow** — hỗ trợ luồng thực tế từ đặt lịch, check-in, điều phối chuyên viên, hoàn thành dịch vụ đến thanh toán.
3. **Inventory Control** — cấu hình định mức vật liệu (BOM) cho từng dịch vụ, theo dõi tồn kho qua `stock_ledger` đơn giản (không FIFO/batches), tự động trừ kho khi invoice chuyển sang `PAID`.
4. **Management Visibility** — dashboard và báo cáo giúp quản trị viên theo dõi doanh thu, booking, dịch vụ hoàn thành, nhân viên và tồn kho.
5. **Role Clarity** — hệ thống dùng 3 role chính: `ADMIN`, `OPERATOR`, `STAFF`; `OPERATOR` gộp lễ tân và thu ngân.

---

## Project Scope

### In scope theo vai trò

#### Khách hàng

- Xem danh sách dịch vụ: tên, mô tả, đơn giá, thời lượng.
- Đặt lịch trực tuyến qua landing page: chọn dịch vụ, ngày giờ, nhập thông tin liên hệ.
- Nhận xác nhận qua OTP (email là primary cho demo, console mock cho dev) — không cần tạo tài khoản.
- Thanh toán trực tiếp tại quầy hoặc qua VNPay nếu hệ thống hỗ trợ.

#### Nhân viên vận hành / `OPERATOR`

- Đăng nhập hệ thống.
- Tra cứu lịch hẹn theo tên khách hàng, số điện thoại, ngày hẹn hoặc trạng thái.
- Check-in khách đã đặt lịch trước.
- Tiếp nhận khách vãng lai.
- Quản lý danh sách khách đang chờ phục vụ.
- Phân công chuyên viên Spa thực hiện dịch vụ dựa trên lịch trống (slot availability có buffer 15 phút).
- Cập nhật trạng thái lịch hẹn: chờ xác nhận, đã xác nhận, đang thực hiện, hoàn thành, đã hủy.
- Tạo và quản lý phiếu dịch vụ cho khách.
- Thêm, sửa, xóa dịch vụ trong phiếu.
- Ghi nhận chi phí phát sinh hoặc ghi chú nếu có.
- Xác nhận hoàn thành sau khi chuyên viên báo cáo làm xong.
- Chuyển phiếu dịch vụ sang bước thanh toán.
- Xem danh sách phiếu dịch vụ/hóa đơn chờ thanh toán.
- Tạo và kiểm tra hóa đơn từ phiếu dịch vụ.
- Tính tổng tiền dựa trên dịch vụ, chi phí phát sinh và giảm giá nếu có.
- Chọn phương thức thanh toán và xác nhận thanh toán.
- In hóa đơn nếu hệ thống hỗ trợ.
- Tra cứu, lọc hóa đơn theo khách hàng, ngày, trạng thái hoặc mã hóa đơn.

#### Chuyên viên Spa / `STAFF`

- Có tài khoản hệ thống, đăng nhập được dùng chung auth từ Issue #02.
- **Không có module UI riêng trong scope đồ án** — các action nghiệp vụ của STAFF (nhận phân công, báo cáo hoàn thành, ghi chú phát sinh) được OPERATOR thực hiện thay mặt trong scope hiện tại.
- Không tạo endpoint hoặc guard riêng cho STAFF ngoài những gì issue yêu cầu tường minh.

#### Quản trị viên / `ADMIN`

- Đăng nhập hệ thống.
- Quản lý tài khoản và phân quyền nhân viên.
- Cấu hình tài khoản nhân viên: cấp lại mật khẩu, khóa/mở khóa tài khoản.
- Quản lý danh sách dịch vụ: thêm, sửa, ẩn/xóa, cấu hình giá, thời lượng và trạng thái.
- Upload ảnh dịch vụ qua Cloudinary.
- Cấu hình định mức tiêu hao vật liệu (BOM) cho từng dịch vụ.
- Quản lý nhân viên: thông tin cá nhân, vai trò, trạng thái làm việc, lương cơ bản và hoa hồng theo dịch vụ.
- Quản lý kho vật liệu: thêm, sửa, nhập kho thủ công, theo dõi tồn kho và tự động trừ kho khi invoice PAID.
- Theo dõi cảnh báo vật liệu sắp hết (`stock_quantity <= reorder_level`).
- Quản lý khách hàng và lịch sử sử dụng dịch vụ ở phía nội bộ.
- Xem dashboard tổng quan về doanh thu, booking, dịch vụ hoàn thành và tồn kho.
- Xem báo cáo doanh thu theo khoảng thời gian, lọc theo dịch vụ.
- Thống kê số lượng booking, dịch vụ hoàn thành theo dịch vụ và theo nhân viên.
- Xuất báo cáo ra file Excel hoặc PDF.

### In scope kỹ thuật đang dùng cho các issue

- **Authentication & Authorization** — JWT, RBAC 3 roles (`ADMIN`, `OPERATOR`, `STAFF`). Global guards: `JwtAuthGuard` → `MustChangePasswordGuard` → `RolesGuard` (thứ tự bắt buộc).
- **Employee management** — CRUD nhân viên, cấp lại mật khẩu, khóa/mở khóa tài khoản, xóa tài khoản theo rule issue.
- **Customer management** — khách hàng không có tài khoản, định danh chính qua số điện thoại. Booking xác nhận qua OTP (email primary cho demo, console mock cho dev) — ISmsProvider interface cho extensibility.
- **Service catalog** — dịch vụ, ảnh dịch vụ, trạng thái, giá, thời lượng. Định mức vật liệu (BOM) lưu trong `service_material_bom`, hỗ trợ `standard_quantity` phân số cho vật liệu khấu hao.
- **Booking / Service ticket** — lịch hẹn, check-in, khách vãng lai, hàng đợi, phiếu dịch vụ, ghi chú và chi phí phát sinh. Slot availability tính `totalBlockTime = durationMinutes + cleanupMinutes` với buffer 15 phút giữa các booking.
- **Invoice & Payment** — tạo hóa đơn từ phiếu dịch vụ, thanh toán tại quầy (CASH) hoặc VNPay sandbox (VNPAY). Invoice status flow: `DRAFT → PENDING_PAYMENT → PAID`. VNPay IPN webhook trigger auto stock deduction và commission calculation.
- **Inventory** — vật liệu (`materials`), định mức (`service_material_bom`), tồn kho qua `stock_ledger` (audit trail đơn giản — không FIFO, không batches), nhập kho thủ công (`POST /stock/in`), xuất kho thủ công (`POST /stock/out/manual`), tự động trừ kho khi invoice `PAID`, cảnh báo sắp hết (`GET /materials/low-stock`).
- **Commission & Payroll** — `commission_rate` lưu per-service trên `staff_service_assignments`; công thức lương: `Lương tháng = base_salary + Σ(commission_rate × service_price)` cho mỗi invoice PAID trong tháng; **không có KPI, không có thâm niên**; snapshot tại thời điểm tính lương (không reference live rate). Collections `commission_kpi_policies` và `commission_seniority_tiers` không dùng.
- **Reports** — dashboard, báo cáo doanh thu, thống kê booking/dịch vụ/nhân viên, export Excel/PDF nếu issue yêu cầu.
- **OTP verification** — `EmailOtpProvider` primary (Nodemailer, free, không cần đăng ký); `ConsoleSmsOtpProvider` mock cho dev; interface `ISmsProvider` cho extensibility.

### Quyết định kỹ thuật đã chốt toàn dự án

| Quyết định | Lựa chọn | Lý do |
|---|---|---|
| Inventory audit | `stock_ledger` đơn giản (không FIFO/batches) | Đủ cho scope PDF, giảm complexity |
| Stock source of truth | `material.stock_quantity` (mutate trực tiếp) | Đơn giản, đủ cho MVP 1 chi nhánh |
| Stock mutation | BẮT BUỘC wrap trong MongoDB transaction | Đảm bảo `stock_quantity` và `stock_ledger` luôn đồng bộ |
| OTP provider | Email (Nodemailer) primary | Tránh SMS Brandname registration delay |
| Payment | VNPay sandbox | Free, deployable, không cần đăng ký doanh nghiệp |
| Commission | Snapshot tại thời điểm PAID | Không bị ảnh hưởng khi rate thay đổi sau |
| Decimal quantity | Integer × 10000 trước khi lưu | Tránh float precision với vật liệu khấu hao (0.01 bộ đá) |
| Repo structure | Git Subtree (BE parent, FE child) | Node/TS version incompatibility giữa BE và FE |
| Type sharing | OpenAPI flow — `umi openapi` generate từ `swagger.json` | Single source of truth, không copy tay |

### Transaction bắt buộc cho các operation sau

```
markInvoicePaid()     → update invoice.status + trừ stock + ghi ledger (1 transaction)
stockIn()             → update material.stock_quantity + ghi ledger (1 transaction)
stockOutManual()      → update material.stock_quantity + ghi ledger (1 transaction)
```

Các CRUD thông thường (service, employee, supplier...) không cần transaction.

### Out of scope

- Multi-branch — chỉ quản lý 1 chi nhánh trong đồ án.
- Tách role lễ tân và thu ngân — cả hai gộp thành `OPERATOR`.
- Giao diện riêng cho `STAFF` ngoài các thao tác issue yêu cầu tường minh.
- OAuth, 2FA, refresh token và forgot password tự động qua email.
- SMS/OTP production (Viettel, VNPT) — mock hoặc xác nhận thủ công là đủ cho MVP.
- **FIFO/LIFO inventory, material batches** — không implement trong đồ án.
- Kế toán đầy đủ, payroll phức tạp, báo cáo tài chính chuyên sâu.
- **KPI commission và seniority (thâm niên)** — công thức hoa hồng chỉ gồm `base_salary + hoa hồng dịch vụ`; không implement `commission_kpi_policies`, `commission_seniority_tiers`, `commission_records`.
- Realtime WebSocket nếu issue không yêu cầu trực tiếp.
- Audit log đầy đủ cấp hệ thống ngoài `stock_ledger`.
- Test coverage 100% — ưu tiên unit/e2e cho critical paths.
- Cron job tự động (low stock notification push, auto delete account...).

---

## High-Risk Features (thiết kế kỹ trước khi code)

4 features phức tạp nhất, là critical path của dự án. Cần có technical draft trước weekend sprint để không bắt đầu từ zero.

### 1. OTP Booking Confirmation

- **Provider:** `EmailOtpProvider` (Nodemailer) primary; `ConsoleSmsOtpProvider` mock cho dev.
- **Interface:** `ISmsProvider` — extensible, có thể thêm `ViettelSmsOtpProvider` sau.
- **Flow:** Khách đặt lịch → hệ thống gửi OTP → khách nhập OTP → booking confirmed.
- **Risk:** Email deliverability trong môi trường demo — test bằng tài khoản Gmail thật.

### 2. Commission / Payroll Calculation

- **Formula:** `Lương tháng = base_salary + Σ(commission_rate × service_price)` cho mỗi invoice PAID trong tháng.
- **Không có KPI, không có thâm niên** — đã bỏ hoàn toàn. Không implement `commission_kpi_policies`, `commission_seniority_tiers`.
- **commission_rate** lưu per-service trên `staff_service_assignments` (tỉ lệ % hoa hồng của chuyên viên với dịch vụ đó), không flat trên staff.
- **service_price** lấy từ snapshot trong invoice/phiếu dịch vụ — không dùng giá live từ `services`.
- **Trigger:** Aggregate tất cả invoice PAID trong tháng → group theo staff → tạo `salary_records` snapshot khi admin chốt lương tháng.
- **Snapshot bắt buộc:** `salary_records` lưu `base_salary`, `total_commission`, `total_salary` tại thời điểm chốt — không thay đổi dù rate sau này bị sửa.
- **Risk:** Cần tránh N+1 khi aggregate — thiết kế aggregation pipeline trước khi code.

### 3. Slot Availability

- **Formula:** `totalBlockTime = durationMinutes + cleanupMinutes`
- **Buffer:** 15 phút giữa các booking của cùng 1 chuyên viên.
- **Logic:** Query bookings trong ngày của staff → tìm slot trống → trả về danh sách giờ khả dụng.
- **Risk:** Edge case overlap khi 2 booking cùng lúc — cần atomic check + lock.

### 4. Material Depreciation (Auto Stock Deduction)

- **Trigger:** Invoice chuyển sang `PAID` → đọc BOM của từng service trong invoice → trừ kho.
- **Fractional quantity:** Vật liệu khấu hao dùng phân số (0.01 bộ đá, 0.05 túi chườm, 0.1 nến).
- **Lưu ý:** Tất cả trong 1 transaction với `markInvoicePaid()`.
- **Decision đã chốt:** Nếu stock không đủ → vẫn cho PAID, stock âm, ghi ledger bình thường. Admin kiểm kê sau. Không reject thanh toán vì lý do kho.
- **Risk:** Decimal precision — dùng integer × 10000.

---

## Stakeholders

| Vai trò | Mục đích sử dụng |
|---|---|
| **ADMIN (Quản trị viên)** | Quản lý tài khoản, phân quyền, dịch vụ, ảnh dịch vụ, BOM, nhân viên, kho, khách hàng nội bộ, dashboard và báo cáo |
| **OPERATOR (Nhân viên vận hành)** | Gộp lễ tân và thu ngân: tra cứu lịch hẹn, check-in, tiếp nhận khách vãng lai, điều phối chuyên viên, lập phiếu dịch vụ, tạo hóa đơn và thu tiền |
| **STAFF (Chuyên viên Spa)** | Có tài khoản hệ thống nhưng không có UI riêng trong scope đồ án; OPERATOR thực hiện thay mặt các action nghiệp vụ |
| **Customer (Khách hàng)** | Xem dịch vụ, đặt lịch online qua landing page, xác nhận qua OTP email hoặc điện thoại, thanh toán tại quầy hoặc VNPay |

---

## Team

| Vai trò | Người | Trách nhiệm |
|---|---|---|
| Nhóm trưởng / Lead BE | Vũ Minh Khang (Khang) | Điều phối dự án, backend chính, infrastructure |
| BE | Bùi Phạm Nam Khánh (Khanh) | Backend |
| Lead FE | Phạm Xuân Công | Umi + Ant Design Pro, tích hợp API qua `umi openapi` |
| BA / Tester | Đinh Minh Trang | Business analysis, test plan |

Git username mapping: `Khangvu345` → Khang, `khanhbpn12` → Khanh. Xem `ai-docs/_config.md`.

---

## Reference

- **Scope chốt (nguồn tin cậy cho nghiệp vụ/role):** `Nhóm 3 chốt.pdf`
- **ERD:** `documents/ERD.md` - v7 *(nếu chưa tạo: tham chiếu schema trong từng issue)*
- **Coding convention:** `CODING_CONVENTION.md` (project root)
- **Contributing guide:** `CONTRIBUTING.md` (project root)
- **README dự án:** `README.md` (project root)
- **AI workflow:** `ai-docs/WORKFLOW.md`

---

## Lưu ý quan trọng cho AI

- **Scope chốt thắng khi xác định nghiệp vụ/role** — dùng `Nhóm 3 chốt.pdf` làm chuẩn cho phạm vi sản phẩm và actor.
- **Issue thắng khi triển khai kỹ thuật cụ thể** — nếu issue đã chỉ rõ endpoint, schema, guard, rule nghiệp vụ chi tiết thì theo issue; nếu mâu thuẫn lớn với scope chốt thì ghi rõ khi báo cáo.
- **Role backend hiện tại chỉ còn 3 role** — `ADMIN`, `OPERATOR`, `STAFF`; không dùng lại `RECEPTIONIST` hoặc `CASHIER` trong logic mới.
- **Không tạo endpoint/guard riêng cho STAFF** trừ khi issue yêu cầu tường minh.
- **MongoDB Atlas free tier** dùng cho shared integration; **Docker Compose local** với replica set 1-node cho dev nếu cần transaction.
- **Snapshot pattern bắt buộc cho dữ liệu tài chính** — phiếu dịch vụ, hóa đơn, hoa hồng, vật liệu tiêu hao phải lưu giá trị tại thời điểm phát sinh, không reference live data.
- **Stock mutation luôn trong transaction** — không bao giờ mutate `material.stock_quantity` mà không ghi `stock_ledger` entry trong cùng 1 transaction.
- **Không implement FIFO/batches** — đây là out of scope đã chốt dù memory context có thể nhắc đến từ cuộc trò chuyện cũ hơn.
- **Vietnamese domain terms** trong code/log/UI: phiếu dịch vụ, lịch hẹn, chuyên viên, nhân viên vận hành, hoa hồng, định mức, vật liệu, tồn kho.

# Nhóm 3 chốt — Hệ thống Quản lý Spa

---

## Ý tưởng chính

Xây dựng hệ thống web quản lý hoạt động Spa, cho phép khách hàng đặt lịch dịch vụ qua landing page với xác thực OTP; nhân viên vận hành tiếp nhận khách, điều phối chuyên viên, lập phiếu dịch vụ và thanh toán; quản trị viên quản lý dịch vụ, kho vật liệu, nhân sự — hoa hồng và theo dõi báo cáo doanh thu.

---

## Yêu cầu

### Khách hàng

- Xem danh sách dịch vụ: tên, mô tả, đơn giá, thời lượng.
- Đặt lịch trực tuyến qua landing page: chọn dịch vụ, ngày giờ, nhập thông tin liên hệ.
- Nhận thông báo xác nhận thông qua OTP nếu hệ thống hỗ trợ, hoặc nhận xác nhận qua điện thoại từ nhân viên.
- Thanh toán trực tiếp tại quầy hoặc qua phương thức VNPay (nếu hệ thống hỗ trợ).

---

### Nhân viên vận hành / Lễ tân - Thu ngân

- Đăng nhập.
- Tra cứu lịch hẹn theo tên khách hàng, số điện thoại, ngày hẹn hoặc trạng thái.

#### Module tiếp nhận và điều phối khách

- Check-in khách đã đặt lịch trước.
- Tiếp nhận khách vãng lai.
- Quản lý danh sách khách đang chờ phục vụ.
- Phân công chuyên viên Spa thực hiện dịch vụ dựa trên lịch trống.
- Cập nhật trạng thái lịch hẹn: chờ xác nhận, đã xác nhận, đang thực hiện, hoàn thành, đã hủy.

#### Module phiếu dịch vụ

- Tạo và quản lý phiếu dịch vụ cho khách.
- Thêm, sửa, xóa dịch vụ trong phiếu.
- Ghi nhận chi phí phát sinh hoặc ghi chú nếu có.
- Xác nhận hoàn thành sau khi chuyên viên báo cáo làm xong.
- Chuyển phiếu dịch vụ sang bước thanh toán.

#### Module thanh toán

- Xem danh sách phiếu dịch vụ/hóa đơn chờ thanh toán.
- Tạo và kiểm tra hóa đơn từ phiếu dịch vụ.
- Tính tổng tiền dựa trên dịch vụ, chi phí phát sinh và giảm giá nếu có.
- Chọn phương thức thanh toán.
- Xác nhận thanh toán.
- In hóa đơn nếu hệ thống hỗ trợ.
- Tra cứu, lọc hóa đơn theo khách hàng, ngày, trạng thái hoặc mã hóa đơn.

---

### Chuyên viên Spa

> Vai trò nghiệp vụ, không có giao diện riêng trong hệ thống.

- Nhận phân công dịch vụ từ nhân viên vận hành.
- Thực hiện dịch vụ theo lịch được giao.
- Báo cáo hoàn thành dịch vụ sau khi làm xong.
- Ghi chú phát sinh trong quá trình thực hiện nếu có.

---

### Quản trị viên

- Đăng nhập.
- Quản lý tài khoản và phân quyền nhân viên.
- Cấu hình tài khoản nhân viên: cấp lại mật khẩu, khóa/mở khóa tài khoản.
- Quản lý danh sách dịch vụ: thêm, sửa, ẩn/xóa, cấu hình giá, thời lượng và trạng thái.
- Upload ảnh dịch vụ qua Cloudinary.
- Cấu hình sẵn định mức tiêu hao cho từng dịch vụ.
- Quản lý nhân viên: thông tin cá nhân, vai trò, trạng thái làm việc, lương cơ bản và hoa hồng theo dịch vụ.
- Quản lý kho vật liệu: thêm, sửa, theo dõi tồn kho và tự động trừ kho khi hoàn thành dịch vụ.
- Theo dõi cảnh báo vật liệu sắp hết.
- Quản lý khách hàng và lịch sử sử dụng dịch vụ ở phía nội bộ.
- Xem dashboard tổng quan về doanh thu, booking, dịch vụ hoàn thành và tồn kho.
- Xem báo cáo doanh thu theo khoảng thời gian, lọc theo dịch vụ.
- Thống kê số lượng booking, dịch vụ hoàn thành theo dịch vụ và theo nhân viên.
- Xuất báo cáo ra file Excel hoặc PDF.
