 > **Phiên bản:** v7 (chốt nghiệp vụ kho end-to-end + auth & quản lý nhân viên)  
> **16 collections** (15 chính thức + 1 phác thảo `otp_verifications` future)  
> **Thay đổi v6 → v7:**
> - 🔧 Schema `staff` tách 2 status: `work_status` (HR) + `account_status` (Auth)
> - ➕ Thêm `started_at`, `locked_at`, `must_change_password` cho staff
> - 🗑️ Bỏ field `is_active` của staff (gây nhầm lẫn 2 khái niệm)
> - 📚 Thêm mục §2.11 — Quản lý nhân viên & xác thực
## 2. Đặc tả nghiệp vụ chi tiết
 
### 2.1. Mô hình khách hàng
 
- Khách **không có account**, định danh duy nhất qua `phone`.  Staff phải login để dùng hệ thống (xem §2.11)
- Lần đặt đầu: hệ thống auto-create customer record từ form.
- Lần sau: `findOne({ phone })` trả về record cũ — track lịch sử.
- Email là optional (dùng cho OTP qua email khi triển khai sau).
### 2.2. Booking flow — Fixed-Service Model
 
**Quy tắc cốt lõi:**
- 1 booking = 1 service = 1 nhân viên = 1 slot thời gian.
- Khi booking chuyển sang `IN_PROGRESS`, **không cho phép thêm/đổi service** trong ca.
- Khách muốn thêm dịch vụ → tạo booking mới sau khi ca hiện tại kết thúc.
**Booking Group — đặt nhiều dịch vụ liên tiếp:**
- Khách đặt online "Massage Chân 9h + Cổ Vai Gáy 10h" → hệ thống tạo **2 booking riêng**.
- Cả 2 share cùng 1 `booking_group_code` (vd: `GRP-20250505-001`).
- Email xác nhận tổng hợp cả 2 booking.
- Lễ tân search theo `booking_group_code` để xem toàn bộ lịch khách.
- Cancel 1 booking trong group **không** ảnh hưởng các booking khác.
**Status flow:**
```
PENDING → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED → (invoice tạo)
        ↓
        CANCELLED
        NO_SHOW (không check-in sau 30 phút)
```
 
**Buffer time:**
- Mỗi service có `buffer_minutes` riêng (10-20 phút).
- Slot occupied = `[scheduled_at, scheduled_at + duration_minutes + buffer_minutes]`.
- **Early Release:** nếu nhân viên hoàn thành sớm (`completed_at < scheduled_end`), slot giải phóng ngay → tối ưu công suất.
### 2.3. BOM (Bill of Materials) & Khấu hao
 
**Recipe per service** lưu trong `service_materials`:
```
Massage Đá Nóng:
  - 30 ml Tinh dầu Olive       (tiêu hao)
  - 1  cái Khăn giấy           (tiêu hao)
  - 0.01 bộ Đá núi lửa         (khấu hao - 1 bộ = 100 ca)
```
 
**Logic trừ kho:** Khi `invoice.status` chuyển sang `PAID`:
1. Loop qua tất cả services trong invoice.
2. Mỗi service → loop qua `service_materials` (BOM).
3. Tạo **`stock_issues`** record (1 stock_issue cho 1 invoice — gom tất cả material).
4. Trừ `material.stock_quantity -= service_materials.quantity` với mỗi item.
5. Nếu `stock_quantity < low_stock_threshold` → emit cảnh báo.
**Phân biệt tiêu hao vs khấu hao:** chỉ khác ở `quantity` trong BOM (30ml vs 0.01 bộ). Logic trừ kho giống hệt nhau. Đơn vị `unit` quyết định cách hiển thị báo cáo.
 
> Chi tiết flow xuất kho: xem **§2.10 — Nghiệp vụ kho end-to-end**.
 
### 2.4. Commission — Công thức 3 lớp
 
```
Commission_total = C_base + C_kpi + C_seniority
```
 
**Lớp 1 — `C_base`:** cố định per service, lưu trong `commission_configs.c_base`.
- Massage Thụy Điển 60p → 50,000đ/ca
- Massage Đá Nóng 90p → 80,000đ/ca
**Lớp 2 — `C_kpi`:** thưởng bậc thang theo TỔNG số ca/tháng (cộng dồn tất cả service).
- `kpi_threshold = 50` (vd).
- Ca 1-50: `C_kpi = 0`.
- Ca 51 trở đi: `C_kpi = c_kpi_bonus` (vd: +20,000đ/ca).
- Reset mỗi tháng.
**Lớp 3 — `C_seniority`:** thâm niên CHUYÊN MÔN per service per staff.
- Tính từ `staff_services.started_at` đến cuối kỳ tính lương.
- Lookup trong `commission_configs.seniority_tiers`:
  ```json
  [
    { "min_years": 0, "max_years": 1,  "bonus_per_session": 0 },
    { "min_years": 1, "max_years": 3,  "bonus_per_session": 10000 },
    { "min_years": 3, "max_years": 99, "bonus_per_session": 25000 }
  ]
  ```
 
**Trường hợp 1 nhân viên làm nhiều service:**
- Mỗi service có `staff_services` record riêng → `started_at` riêng.
- Tính thâm niên độc lập per service.
- KPI threshold đếm tổng ca tất cả service.
### 2.5. Payroll — Tính lương tháng
 
**Generate payroll cho period `YYYY-MM`:**
1. Query tất cả invoice `PAID` trong period.
2. Group theo `staff_id` (lấy từ `services_snapshot.staff_id`).
3. Mỗi staff:
   - Đếm `sessions_count` (tổng số ca).
   - Loop từng ca theo thứ tự thời gian:
     - Lấy `c_base` từ `commission_configs` của service.
     - Nếu `session_index > kpi_threshold` → cộng `c_kpi_bonus`.
     - Tính thâm niên = `(invoice.paid_at - staff_services.started_at) / 365`.
     - Lookup tier → cộng `bonus_per_session`.
   - Snapshot toàn bộ vào `commission_details` array.
4. `total_amount = base_salary + total_commission`.
5. Status `DRAFT` → admin duyệt → `PAID`.
**Snapshot quan trọng:** payroll lưu giá trị tại thời điểm generate. Admin sửa `c_base` từ 50k→60k sau đó, payroll cũ KHÔNG bị ảnh hưởng.
 
### 2.6. CRUD cho cấu hình nghiệp vụ (ADMIN-only)
 
Tất cả các thông tin sau **CRUD được**:
- `commission_configs` (c_base, kpi_threshold, c_kpi_bonus, seniority_tiers)
- `staff_services` (started_at, is_primary)
- `service_materials` (BOM recipe)
- `services` (duration, buffer, unit_price)
- `materials` (low_stock_threshold)
- `operational_costs`
- `staff` (employee CRUD — xem §2.11)
### 2.7. Thanh toán — VNPay Sandbox + CASH
 
**Status flow:**
```
DRAFT → PENDING_PAYMENT (URL VNPay) → PAID (IPN webhook)
                                    ↓
                                    FAILED
DRAFT → PAID (CASH - lễ tân thu trực tiếp)
```
 
**VNPay flow:**
1. Cashier confirm → `POST /invoices/:id/pay` với `payment_method=VNPAY`.
2. BE generate URL VNPay (HMAC SHA512) → `status = PENDING_PAYMENT`.
3. Khách thanh toán trên cổng VNPay.
4. VNPay callback:
   - `vnp_ReturnUrl` (browser): hiển thị kết quả cho khách.
   - `vnp_IpnUrl` (server-to-server): BE verify signature → update `PAID` + `paid_at`.
5. **Trigger tạo `stock_issues` + trừ kho BOM** (xem §2.10).
**`payment_logs`** lưu mọi event để debug khi sai signature.
 
### 2.8. OTP Verification (Future - phác thảo)
 
- Hybrid: `EmailOtpProvider` (primary) + `ConsoleSmsOtpProvider` (dev mock).
- Interface `ISmsProvider` → swap sang `ViettelSmsOtpProvider` khi spa có ĐKKD thật.
- TTL index trên `expires_at` → MongoDB tự xóa OTP hết hạn.
- Max 3 lần verify sai → khóa.
- OTP này chỉ dùng cho khách xác nhận booking. Staff login bằng email + password (xem §2.11), không qua OTP.
### 2.9. Operational Costs (Tuần 3)
 
- Quản lý chi phí vận hành tách biệt với BOM:
  - Giặt ủi đồng phục Massage Thái: PER_SESSION, gắn `service_id`.
  - Tiền điện nước: PER_MONTH.
  - Vệ sinh tổng hợp: PER_DAY.
- Khi invoice PAID + service có operational_cost → tự động log entry.
- Báo cáo cuối tháng: tách COGS (giá vốn từ BOM) và OpEx (chi phí vận hành).
### 2.10. Nghiệp vụ kho — End-to-End
 
> **Mục tiêu:** Quản lý vòng đời vật liệu từ lúc nhập kho từ nhà cung cấp → định nghĩa BOM → tự động trừ khi khách thanh toán → audit trail đầy đủ.
 
#### 2.10.1. Phiếu nhập kho (`stock_receipts`)
 
**Khi nào tạo:** Thủ kho mua vật liệu từ nhà cung cấp về.
 
**Luồng:**
1. Thủ kho chọn `supplier_id` (hoặc tạo mới nếu chưa có).
2. Thêm từng item: `material_id`, `quantity`, `unit_price` (giá nhập tại thời điểm này).
3. Hệ thống auto-compute `subtotal` từng item và `total_purchase_amount`.
4. Submit → `stock_receipts` record được tạo.
5. **Cộng `materials.stock_quantity`** theo từng item.
6. **Cập nhật `materials.unit_price`** = giá nhập gần nhất (để tính giá vốn cho BOM xuất sau này — xem §2.10.4 về policy giá vốn).
**Quy tắc:**
- Sau khi tạo, phiếu nhập **immutable** — không cho sửa items hay total.
- Sửa lỗi: tạo phiếu điều chỉnh mới (chưa implement trong MVP).
- `created_by` snapshot ai tạo phiếu để audit.
#### 2.10.2. BOM (`service_materials`)
 
**Khi nào dùng:** Admin định nghĩa định mức tiêu hao cho mỗi dịch vụ (1 lần setup, sau đó CRUD khi cần điều chỉnh).
 
**Vai trò:** Là "công thức" để hệ thống biết khi service X được thực hiện thì trừ kho những vật liệu nào, số lượng bao nhiêu.
 
**Không phải transaction** — chỉ là cấu hình. Không lưu lịch sử thay đổi (để đơn giản cho MVP).
 
#### 2.10.3. Phiếu xuất kho (`stock_issues`) — Phương án C
 
**Khi nào tạo (MVP):** Tự động sinh ra khi `invoices.status` chuyển sang `PAID` (cả CASH lẫn VNPAY).
 
**Luồng tạo `stock_issues` khi invoice PAID:**
 
```
[Invoice PAID]
    ↓
[Begin Transaction]
    ↓
1. Đọc invoice.services_snapshot
2. Với mỗi service trong invoice:
     - Query service_materials (BOM) theo service_id
     - Tích lũy danh sách items cần xuất
3. Tạo 1 stock_issues record:
     - issue_type = "SERVICE"
     - invoice_id = <invoice._id>
     - booking_id = invoice.booking_id (denormalize)
     - items = danh sách đã tích lũy
     - total_cost_amount = sum(items.subtotal_cost)
     - created_by = "SYSTEM"
4. Với mỗi item: materials.stock_quantity -= item.quantity
5. Kiểm tra low_stock_threshold → emit warning event
    ↓
[Commit Transaction]
```
 
**Quy tắc 1 invoice → 1 stock_issue:**
- Gom tất cả material của tất cả service trong invoice vào **1 stock_issues** duy nhất (không tách nhỏ).
- Lý do: dễ truy vấn (`invoice → stock_issue` 1-1), audit gọn, tránh tạo nhiều record nhỏ.
**Lưu ý transaction:**
- MongoDB transaction yêu cầu **replica set** (Atlas sandbox đã có sẵn).
- Local Docker dev: bật replica set 1 node hoặc dùng compensating logic (xem §3 — Indexes & Operational Notes).
- Nếu transaction fail giữa chừng: rollback toàn bộ → invoice quay về `PENDING_PAYMENT`, không tạo stock_issue, không trừ kho.
**Issue types khác (post-MVP, chưa implement):**
- `DAMAGE`: vật liệu hỏng/đổ → `reason` bắt buộc, `created_by` = staff manual.
- `ADJUSTMENT`: kiểm kê thấy lệch → ghi nhận điều chỉnh.
- `EXPIRED`: hết hạn sử dụng.
#### 2.10.4. Policy giá vốn (`cost_per_unit`)
 
**Câu hỏi:** Khi xuất kho 30ml Tinh dầu Olive cho ca massage, tính giá vốn theo giá nhập nào? (Lô tháng 1 giá 5k/ml hay lô tháng 3 giá 6k/ml?)
 
**Lựa chọn cho MVP — Latest Cost (Giá nhập gần nhất):**
- `cost_per_unit` = `materials.unit_price` tại thời điểm xuất.
- Đơn giản, đủ chính xác cho scope đồ án.
- **Trade-off:** không phải FIFO/LIFO chuẩn kế toán — không tracking lô hàng riêng biệt.
**Phương án nâng cấp (post-MVP):**
- Nếu cần FIFO: thêm collection `material_lots` (mỗi phiếu nhập tạo 1 lot, xuất theo thứ tự) → phức tạp hơn nhiều.
- Khuyến nghị: **không làm trong scope đồ án** — trade-off đơn giản/đúng nghiệp vụ.
#### 2.10.5. Truy vấn 2 chiều — Bài toán audit
 
Đây là lý do quan trọng nhất chọn Phương án C thay vì bỏ `stock_issues`.
 
**Truy vấn 1: "Invoice X đã xuất những vật liệu gì?"**
```javascript
db.stock_issues.findOne({ invoice_id: ObjectId("...") })
// → Trả về stock_issue với items embed đầy đủ
```
 
**Truy vấn 2: "Vật liệu Y đã bị xuất khi nào, cho ai?"**
```javascript
db.stock_issues.find({ "items.material_id": ObjectId("...") })
  .sort({ issue_date: -1 })
// → Trả về toàn bộ lịch sử xuất kho của material Y
```
 
**Truy vấn 3: "Tính giá vốn cho báo cáo lợi nhuận tháng X"**
```javascript
db.stock_issues.aggregate([
  { $match: { issue_date: { $gte: startOfMonth, $lte: endOfMonth }, issue_type: "SERVICE" } },
  { $group: { _id: null, totalCOGS: { $sum: "$total_cost_amount" } } }
])
// → Tổng giá vốn xuất kho cho service trong tháng
```
 
**Truy vấn 4: "Kiểm tra trùng — invoice nào đã có stock_issue rồi?"**
```javascript
// Index unique partial: { invoice_id: 1 } where issue_type = "SERVICE"
// → Đảm bảo 1 invoice không tạo 2 stock_issue trùng
```
 
#### 2.10.6. Phân biệt 3 loại "tổng tiền" trong hệ thống kho
 
| Collection | Tên field | Ý nghĩa | Đối tượng |
|---|---|---|---|
| `stock_receipts` | `total_purchase_amount` | Tiền **nhập** trả NCC (giá nhập × SL) | Chi phí mua hàng |
| `stock_issues` | `total_cost_amount` | **Giá vốn** xuất kho (cost × SL) | COGS — Cost of Goods Sold |
| `invoices` | `total_material_amount` | Tiền vật liệu khách trả (giá bán × SL) | Doanh thu vật liệu |
 
**Công thức lợi nhuận từ vật liệu:**
```
Profit_material = total_material_amount (invoice) - total_cost_amount (stock_issue)
```
 
3 con số này là 3 thực thể khác nhau. Đặt tên riêng giúp tránh nhầm khi viết báo cáo và query.
 
---
### 2.11. Quản lý nhân viên & xác thực — Auth + Employee Management

> **Mục tiêu:** Quản lý vòng đời nhân viên từ tạo tài khoản → đăng nhập → 
> đổi mật khẩu → khóa tài khoản → xóa vĩnh viễn. Tách biệt rõ "trạng thái 
> làm việc" (HR) và "trạng thái tài khoản" (Auth).

#### 2.11.1. Roles & quyền hạn

4 vai trò trong hệ thống, **không có role HR/Thủ kho riêng** — ADMIN gánh tất cả:

| Role | Tên gọi | Trách nhiệm chính |
|---|---|---|
| `ADMIN` | Quản lý | Tất cả: thủ kho, dashboard tài chính, CRUD employees, 
                       cấu hình hệ thống, payroll, mọi quyết định kinh tế |
| `RECEPTIONIST` | Lễ tân | Tạo booking, check-in khách, quản lý hàng đợi |
| `CASHIER` | Thu ngân | Tạo invoice, thu tiền (CASH/VNPay), in bill |
| `STAFF` | Nhân viên | Làm dịch vụ massage, update status booking của mình |

#### 2.11.2. Hai loại trạng thái — quan trọng phải phân biệt

Schema `staff` có 2 field status **độc lập**:

**`work_status` — trạng thái LÀM VIỆC (HR perspective):**

| Giá trị | Ý nghĩa |
|---|---|
| `ACTIVE` | Đang làm việc bình thường |
| `ON_LEAVE` | Tạm nghỉ (nghỉ thai sản, nghỉ ốm dài, đi học) |
| `RESIGNED` | Đã nghỉ việc |

**`account_status` — trạng thái TÀI KHOẢN (Auth perspective):**

| Giá trị | Ý nghĩa | Login được? |
|---|---|---|
| `ACTIVE` | Tài khoản hoạt động bình thường | ✅ |
| `LOCKED` | Bị khóa (do admin lock) | ❌ |
| `DELETED` | Đã xóa soft (sau 30 ngày lock) | ❌ |

**Quy tắc quan trọng:**
- Login chỉ check `account_status === ACTIVE` — KHÔNG quan tâm `work_status`
- Nhân viên `work_status = ON_LEAVE` (tạm nghỉ) VẪN login được để xem lương, lịch sử
- Tách 2 status để xử lý case: "nhân viên nghỉ tạm nhưng vẫn cần access app", 
  "nhân viên còn làm nhưng bị tạm khóa account do nghi ngờ bảo mật"

#### 2.11.3. Login flow
 User nhập email + password
↓
BE: query staff theo email
↓
BE: bcrypt.compare(password, password_hash)

Timing attack mitigation: luôn compare kể cả user không tồn tại
(dùng dummy hash)
↓
BE: check account_status === ACTIVE
LOCKED → fail
DELETED → fail
ACTIVE → continue
↓
BE: generate JWT với payload { sub, email, role, mustChangePassword }
↓
Return { user, accessToken }
FE đọc mustChangePassword → redirect đổi password nếu true
**Generic error message:** Tất cả lỗi login (sai email, sai password, locked, 
deleted) đều trả CÙNG message "Email hoặc mật khẩu không đúng" — chống 
user enumeration attack.

#### 2.11.4. Đổi mật khẩu — 2 flow

**Flow A — User tự đổi (`POST /auth/change-password`):**
User: nhập currentPassword + newPassword
BE: verify currentPassword đúng
BE: hash newPassword
BE: update password_hash + must_change_password = false
**Flow B — Admin reset (`POST /employees/:id/reset-password`):**
**Force change password mechanism:**

- `MustChangePasswordGuard` apply global (sau JwtAuthGuard, trước RolesGuard)
- Đọc `req.user.mustChangePassword` từ JWT payload
- Nếu true → block mọi endpoint trừ `/auth/change-password` và `/auth/me`
- Endpoint cho phép phải đánh `@SkipPasswordChange()` decorator

#### 2.11.5. Khóa & xóa tài khoản — 30-day rule

**Lock flow:**
Admin: POST /employees/:id/lock
BE validate:

staff tồn tại + account_status === ACTIVE (LOCKED/DELETED → 400)
staffId !== adminUser.id (admin không lock chính mình → 400)
BE update:
account_status = LOCKED
locked_at = NOW
**Unlock flow (sửa sai):**
Admin: POST /employees/:id/unlock
BE validate: account_status === LOCKED
BE update:

account_status = ACTIVE
locked_at = null

**Delete flow — 30 ngày rule:**
Admin: DELETE /employees/:id
BE validate:

account_status === LOCKED (không cho delete khi ACTIVE → 400)
now() - locked_at >= ACCOUNT_DELETE_AFTER_LOCK_DAYS (default 30)
staffId !== adminUser.id
BE update (soft delete):
account_status = DELETED
email = ${original_email}.deleted.${timestamp}
(giải phóng email cho người mới)
KHÔNG xóa physical record (giữ ref cho bookings/invoices/payrolls historical)
**Tại sao không hard delete?**

Staff được reference từ nhiều collections: `bookings.staff_id`, 
`stock_receipts.created_by`, `payrolls.staff_id`, `services_snapshot.staff_id` 
trong invoices. Hard delete sẽ làm vỡ historical reports. Soft delete giữ 
nguyên ref, chỉ disable login + giải phóng email.

#### 2.11.6. Seed admin đầu tiên

Hệ thống cần ít nhất 1 ADMIN để vận hành. Vì POST /employees yêu cầu 
`@Roles('ADMIN')`, không thể "self-register" admin đầu.

**Giải pháp:** Script seed.

```bash
npm run seed:admin
# Đọc credentials từ .env:
#   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, 
#   SEED_ADMIN_FULL_NAME, SEED_ADMIN_PHONE
# Idempotent: chạy lần 2 thấy đã tồn tại → skip
```

Default values trong `.env.example`:
#### 2.11.7. Trade-offs đã chọn cho MVP

| Vấn đề | Lựa chọn MVP | Trade-off |
|---|---|---|
| JWT revocation | Stateless, không blacklist | User bị fired vẫn dùng được token tới khi expire (3 ngày). Admin có thể `lock account` để force logout ngay |
| Refresh token | Không có | User login lại sau 3 ngày |
| Forgot password | Admin reset thủ công | Không cần email service. Phù hợp scope đồ án nội bộ |
| Username | Dùng email | 1 field, đơn giản. Industry standard cho internal system |
| Audit log | Không có | Post-MVP nếu cần (ai reset password ai, ai lock ai) |
## 3. Indexes cần tạo
 
```
customers:           phone (unique)
staff:               email (unique), account_status, work_status, (account_status, locked_at) compound
services:            code (unique)
materials:           code (unique)
suppliers:           (không bắt buộc unique)
stock_receipts:      receipt_code (unique), supplier_id, receipt_date
stock_issues:        issue_code (unique),
                     invoice_id (unique partial — where issue_type = "SERVICE"),
                     booking_id, issue_date,
                     "items.material_id" (multikey index)
invoices:            invoice_code (unique), vnp_txn_ref (unique sparse), booking_id, paid_at
bookings:            booking_code (unique), booking_group_code (non-unique), scheduled_at
payrolls:            (staff_id, period) compound unique
otp_verifications:   expires_at (TTL index 600s)
service_materials:   (service_id, material_id) compound unique
staff_services:      (staff_id, service_id) compound unique
commission_configs:  service_id (unique)
```
 
**Index đặc biệt cho `stock_issues`:**
- `invoice_id` unique partial (chỉ apply khi `issue_type = "SERVICE"`) → tránh tạo 2 stock_issue cho cùng 1 invoice. Điều kiện partial là cần thiết vì `DAMAGE`/`ADJUSTMENT` có `invoice_id = null` (không thể unique vì nhiều null).
---
 
## 4. Embed structure tham khảo
 
### 4.1. `invoices.services_snapshot` (array item)
```jsonc
{
  "service_id": "ObjectId",
  "service_name": "Massage Đá Nóng",
  "unit_price": 800000,        // giá bán tại thời điểm tạo invoice
  "quantity": 1,
  "subtotal": 800000,
  "staff_id": "ObjectId",
  "staff_name": "Trần Khánh"
}
```
 
### 4.2. `invoices.materials_snapshot` (array item)
```jsonc
{
  "material_id": "ObjectId",
  "material_name": "Tinh dầu Olive",
  "unit_price": 8000,           // giá BÁN cho khách (markup từ giá nhập)
  "quantity": 30,
  "unit": "ml",
  "subtotal": 240000            // = unit_price × quantity
}
```
 
### 4.3. `stock_receipts.items` (array item)
```jsonc
{
  "material_id": "ObjectId",
  "material_code": "MAT-OLI-001",      // snapshot tại thời điểm nhập
  "material_name": "Tinh dầu Olive",   // snapshot
  "quantity": 5,                       // 5 lít nhập về
  "unit": "lít",
  "unit_price": 200000,                // giá nhập = 200k/lít
  "subtotal": 1000000,                 // = unit_price × quantity
  "notes": "Lô sản xuất 03/2025"       // optional
}
```
 
### 4.4. `stock_issues.items` (array item) — Phương án C
```jsonc
{
  "material_id": "ObjectId",
  "material_code": "MAT-OLI-001",      // snapshot
  "material_name": "Tinh dầu Olive",   // snapshot
  "quantity": 30,                      // số lượng XUẤT (theo BOM)
  "unit": "ml",
  "cost_per_unit": 6667,               // giá vốn = 200k/lít ÷ 30ml ≈ 6,667đ/ml (latest cost)
  "subtotal_cost": 200000,             // = quantity × cost_per_unit
  "service_id": "ObjectId",            // dùng cho service nào (Massage Đá Nóng)
  "service_name": "Massage Đá Nóng",   // snapshot tiện cho báo cáo
  "notes": "Theo BOM"                  // hoặc "Khấu hao đá núi lửa 0.01 bộ"
}
```
 
### 4.5. `commission_configs.seniority_tiers`
```jsonc
[
  { "min_years": 0, "max_years": 1,  "bonus_per_session": 0 },
  { "min_years": 1, "max_years": 3,  "bonus_per_session": 10000 },
  { "min_years": 3, "max_years": 99, "bonus_per_session": 25000 }
]
```
 
### 4.6. `payrolls.commission_details` (array item)
```jsonc
{
  "booking_id": "ObjectId",
  "service_name": "Massage Đá Nóng",
  "session_date": "2025-05-15",
  "session_index": 23,                 // ca thứ 23 trong tháng (cộng dồn tất cả service)
  "c_base": 80000,
  "c_kpi": 0,                          // chưa vượt threshold = 50
  "c_seniority": 25000,                // 3+ năm thâm niên
  "total": 105000
}
```
 
---
 
## 5. Tổng quan collections
 
| # | Collection | Mục đích | Ghi chú nghiệp vụ kho |
|---|---|---|---|
| 1 | `customers` | Khách (định danh phone) | |
| 2 | `staff` | Nhân viên + auth (work_status + account_status tách riêng) | `created_by` cho stock_receipts/stock_issues |
| 3 | `services` | Dịch vụ spa + buffer | |
| 4 | `materials` | **Vật liệu kho** | Tracking `stock_quantity` real-time |
| 5 | `suppliers` | **Nhà cung cấp** | Reference từ stock_receipts |
| 6 | `service_materials` | **BOM recipe** | Định mức tiêu hao + khấu hao |
| 7 | `commission_configs` | Cấu hình hoa hồng 3 lớp | |
| 8 | `staff_services` | Junction + thâm niên | |
| 9 | `bookings` | Lịch đặt + group | |
| 10 | `otp_verifications` | OTP (future, phác thảo) | |
| 11 | `invoices` | Hóa đơn + VNPay | Trigger tạo stock_issues khi PAID |
| 12 | `payment_logs` | Log VNPay | |
| 13 | `stock_receipts` | **Phiếu nhập kho** | Cộng stock, snapshot giá nhập |
| 14 | `stock_issues` | **Phiếu xuất kho (mới v6)** | Trừ stock, lưu giá vốn — Phương án C |
| 15 | `payrolls` | Lương + 3-layer commission | |
| 16 | `operational_costs` + logs | Chi phí vận hành | Tách biệt với BOM |