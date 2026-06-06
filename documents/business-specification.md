> Phiên bản: v7
>
> Bản này chốt lại nghiệp vụ kho đầy đủ, đồng thời bổ sung phần xác thực và quản lý nhân viên.
> Hệ thống hiện có 16 collection: 15 collection chính và 1 collection `otp_verifications` để phác thảo cho giai đoạn sau.
>
> Thay đổi chính so với v6:
>
> - Schema `staff` tách rõ 2 trạng thái: `work_status` cho nhân sự và `account_status` cho đăng nhập.
> - Bổ sung các field `started_at`, `locked_at`, `must_change_password`.
> - Bỏ `is_active` trong `staff` vì field này dễ gây nhầm giữa trạng thái làm việc và trạng thái tài khoản.
> - Thêm mục 2.11 về quản lý nhân viên và xác thực.

## 2. Đặc tả nghiệp vụ chi tiết

### 2.1. Mô hình khách hàng

- Khách hàng không có tài khoản đăng nhập. Hệ thống định danh khách bằng `phone`.
- Nhân viên phải đăng nhập mới được sử dụng hệ thống. Chi tiết xem mục 2.11.
- Với lần đặt lịch đầu tiên, hệ thống tạo bản ghi khách hàng từ thông tin trong form đặt lịch.
- Những lần sau, hệ thống tìm lại khách bằng `phone` để nối tiếp lịch sử sử dụng dịch vụ.
- Email không bắt buộc. Field này để sẵn cho trường hợp gửi OTP qua email ở giai đoạn sau.

### 2.2. Quy trình đặt lịch

#### Quy tắc chung

- Một booking tương ứng với một dịch vụ, một nhân viên và một khung giờ cụ thể.
- Khi booking đã chuyển sang `IN_PROGRESS`, không cho phép đổi hoặc thêm dịch vụ vào ca đó.
- Nếu khách muốn làm thêm dịch vụ, lễ tân tạo một booking mới sau khi ca hiện tại kết thúc.

#### Đặt nhiều dịch vụ liên tiếp

Ví dụ khách đặt online "Massage Chân 9h + Cổ Vai Gáy 10h". Hệ thống sẽ tạo 2 booking riêng, không gộp vào một booking lớn.

- Hai booking dùng chung một `booking_group_code`, ví dụ `GRP-20250505-001`.
- Email xác nhận hiển thị tổng hợp toàn bộ các booking trong cùng nhóm.
- Lễ tân có thể tìm theo `booking_group_code` để xem toàn bộ lịch của khách trong lượt đặt đó.
- Nếu hủy một booking trong nhóm, các booking còn lại không bị ảnh hưởng.

#### Luồng trạng thái booking

```text
PENDING -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> COMPLETED -> tạo invoice
        |
        +-> CANCELLED
        +-> NO_SHOW nếu khách không check-in sau 30 phút
```

#### Thời gian đệm

- Mỗi dịch vụ có `buffer_minutes` riêng, thường nằm trong khoảng 10-20 phút.
- Khoảng thời gian bị chiếm của một ca được tính là:

```text
[scheduled_at, scheduled_at + duration_minutes + buffer_minutes]
```

- Nếu nhân viên hoàn thành sớm (`completed_at < scheduled_end`), hệ thống giải phóng slot ngay để có thể nhận lịch mới.

### 2.3. BOM và khấu hao vật liệu

BOM của từng dịch vụ được lưu trong collection `service_materials`. Đây là định mức vật liệu cần dùng khi thực hiện một dịch vụ.

Ví dụ:

```text
Massage Đá Nóng:
  - 30 ml Tinh dầu Olive       (tiêu hao)
  - 1 cái Khăn giấy            (tiêu hao)
  - 0.01 bộ Đá núi lửa         (khấu hao, 1 bộ dùng cho khoảng 100 ca)
```

Khi `invoice.status` chuyển sang `PAID`, hệ thống trừ kho theo các bước:

1. Đọc tất cả dịch vụ trong invoice.
2. Với từng dịch vụ, lấy danh sách vật liệu trong `service_materials`.
3. Tạo một bản ghi `stock_issues` cho invoice đó. Một invoice chỉ sinh một phiếu xuất kho, trong đó gom toàn bộ vật liệu.
4. Trừ `material.stock_quantity` theo số lượng đã cấu hình trong BOM.
5. Nếu tồn kho thấp hơn `low_stock_threshold`, hệ thống ghi nhận cảnh báo tồn kho thấp.

Tiêu hao và khấu hao dùng chung một cách trừ kho. Điểm khác nhau nằm ở `quantity`: ví dụ 30 ml tinh dầu là tiêu hao trực tiếp, còn 0.01 bộ đá nóng là phần khấu hao cho một ca. Field `unit` quyết định cách hiển thị khi làm báo cáo.

Chi tiết luồng xuất kho nằm ở mục 2.10.

### 2.4. Hoa hồng

Hoa hồng của nhân viên được tính theo 3 phần:

```text
commission_total = c_base + c_kpi + c_seniority
```

#### Phần 1: `c_base`

`c_base` là mức hoa hồng cố định theo từng dịch vụ, lưu trong `commission_configs.c_base`.

Ví dụ:

- Massage Thụy Điển 60 phút: 50.000đ/ca.
- Massage Đá Nóng 90 phút: 80.000đ/ca.

#### Phần 2: `c_kpi`

`c_kpi` là thưởng bậc thang theo tổng số ca trong tháng, tính cộng dồn tất cả dịch vụ của nhân viên.

Ví dụ với `kpi_threshold = 50`:

- Ca 1 đến ca 50: `c_kpi = 0`.
- Từ ca 51 trở đi: cộng `c_kpi_bonus`, ví dụ 20.000đ/ca.
- Số ca KPI được reset theo từng tháng.

#### Phần 3: `c_seniority`

`c_seniority` là thưởng thâm niên chuyên môn của nhân viên trên từng dịch vụ.

- Mốc thâm niên tính từ `staff_services.started_at` đến cuối kỳ tính lương.
- Mức thưởng được tra trong `commission_configs.seniority_tiers`.

```json
[
  { "min_years": 0, "max_years": 1, "bonus_per_session": 0 },
  { "min_years": 1, "max_years": 3, "bonus_per_session": 10000 },
  { "min_years": 3, "max_years": 99, "bonus_per_session": 25000 }
]
```

Nếu một nhân viên làm nhiều dịch vụ, mỗi dịch vụ có một bản ghi `staff_services` riêng. Vì vậy thâm niên được tính riêng theo từng dịch vụ, còn KPI vẫn tính theo tổng số ca của nhân viên trong tháng.

### 2.5. Tính lương tháng

Khi tạo payroll cho kỳ `YYYY-MM`, hệ thống xử lý như sau:

1. Lấy tất cả invoice đã `PAID` trong kỳ.
2. Gom nhóm theo `staff_id`, lấy từ `services_snapshot.staff_id`.
3. Với từng nhân viên:
   - Đếm `sessions_count`, tức tổng số ca trong tháng.
   - Duyệt các ca theo thứ tự thời gian.
   - Lấy `c_base` từ cấu hình hoa hồng của dịch vụ.
   - Nếu `session_index > kpi_threshold`, cộng thêm `c_kpi_bonus`.
   - Tính thâm niên từ `staff_services.started_at` đến `invoice.paid_at`.
   - Tra tier thâm niên để lấy `bonus_per_session`.
   - Lưu chi tiết từng ca vào `commission_details`.
4. Tính `total_amount = base_salary + total_commission`.
5. Payroll được tạo ở trạng thái `DRAFT`. Admin duyệt xong mới chuyển sang `PAID`.

Payroll phải lưu snapshot tại thời điểm generate. Nếu sau này admin sửa `c_base` từ 50.000đ lên 60.000đ, các payroll đã tạo trước đó không bị thay đổi.

### 2.6. Cấu hình nghiệp vụ

Admin có quyền CRUD các cấu hình sau:

- `commission_configs`: `c_base`, `kpi_threshold`, `c_kpi_bonus`, `seniority_tiers`.
- `staff_services`: `started_at`, `is_primary`.
- `service_materials`: BOM của từng dịch vụ.
- `services`: thời lượng, buffer, giá dịch vụ.
- `materials`: ngưỡng cảnh báo tồn kho thấp.
- `operational_costs`.
- `staff`: quản lý nhân viên, xem thêm mục 2.11.

### 2.7. Thanh toán

Hệ thống hỗ trợ thanh toán tiền mặt và VNPay Sandbox.

#### Luồng trạng thái

```text
DRAFT -> PENDING_PAYMENT (tạo URL VNPay) -> PAID (IPN webhook)
                                             |
                                             +-> FAILED

DRAFT -> PAID (CASH, lễ tân hoặc thu ngân thu trực tiếp)
```

#### Luồng VNPay

1. Thu ngân xác nhận thanh toán và gọi `POST /invoices/:id/pay` với `payment_method = VNPAY`.
2. Backend tạo URL VNPay bằng HMAC SHA512, sau đó chuyển invoice sang `PENDING_PAYMENT`.
3. Khách thanh toán trên cổng VNPay.
4. VNPay gọi callback:
   - `vnp_ReturnUrl`: callback từ trình duyệt, dùng để hiển thị kết quả cho khách.
   - `vnp_IpnUrl`: callback server-to-server, backend verify chữ ký rồi cập nhật `PAID` và `paid_at`.
5. Khi invoice đã `PAID`, hệ thống tạo `stock_issues` và trừ kho theo BOM.

Collection `payment_logs` lưu lại các event thanh toán để dễ kiểm tra khi có lỗi chữ ký hoặc callback.

### 2.8. OTP xác nhận booking

Phần OTP để ở mức phác thảo cho giai đoạn sau.

- Mặc định dùng `EmailOtpProvider`.
- Môi trường dev có thể dùng `ConsoleSmsOtpProvider` để mock.
- Tách interface provider để sau này có thể đổi sang nhà cung cấp SMS thật, ví dụ Viettel.
- `expires_at` dùng TTL index để MongoDB tự xóa OTP hết hạn.
- Nếu nhập sai OTP quá 3 lần thì khóa mã xác thực.
- OTP chỉ dùng cho khách xác nhận booking. Nhân viên đăng nhập bằng email và mật khẩu, không dùng OTP.

### 2.9. Chi phí vận hành

Chi phí vận hành được quản lý riêng với BOM:

- Giặt ủi đồng phục Massage Thái: `PER_SESSION`, gắn với `service_id`.
- Tiền điện nước: `PER_MONTH`.
- Vệ sinh tổng hợp: `PER_DAY`.

Khi invoice đã `PAID` và dịch vụ có cấu hình chi phí vận hành, hệ thống tự ghi log chi phí. Báo cáo cuối tháng cần tách rõ COGS, tức giá vốn từ BOM, và OpEx, tức chi phí vận hành.

### 2.10. Nghiệp vụ kho đầy đủ

Mục tiêu của phần kho là quản lý được toàn bộ vòng đời vật liệu: nhập từ nhà cung cấp, cấu hình BOM, tự động xuất kho khi khách thanh toán và có đủ dữ liệu để audit.

#### 2.10.1. Phiếu nhập kho (`stock_receipts`)

Phiếu nhập kho được tạo khi thủ kho mua vật liệu từ nhà cung cấp.

Luồng xử lý:

1. Thủ kho chọn `supplier_id`, hoặc tạo nhà cung cấp mới nếu chưa có.
2. Thêm từng item gồm `material_id`, `quantity`, `unit_price`.
3. Hệ thống tính `subtotal` cho từng item và `total_purchase_amount` của phiếu.
4. Submit phiếu nhập, hệ thống tạo bản ghi `stock_receipts`.
5. Cộng `materials.stock_quantity` theo từng item.
6. Cập nhật `materials.unit_price` bằng giá nhập gần nhất để dùng cho tính giá vốn khi xuất kho.

Quy tắc:

- Sau khi tạo, phiếu nhập không cho sửa item hoặc tổng tiền.
- Nếu nhập sai, tạo một phiếu điều chỉnh mới. Phần này chưa đưa vào phạm vi hiện tại.
- `created_by` lưu người tạo phiếu để phục vụ audit.

#### 2.10.2. BOM (`service_materials`)

Admin dùng BOM để định nghĩa định mức vật liệu cho từng dịch vụ. Đây là phần cấu hình, không phải giao dịch kho.

Nói cách khác, BOM cho hệ thống biết: khi thực hiện dịch vụ X thì cần trừ những vật liệu nào, với số lượng bao nhiêu.

Trong phạm vi hiện tại, hệ thống không lưu lịch sử thay đổi BOM để giữ thiết kế đơn giản.

#### 2.10.3. Phiếu xuất kho (`stock_issues`)

Ở phiên bản hiện tại, phiếu xuất kho được tạo tự động khi `invoices.status` chuyển sang `PAID`, áp dụng cho cả tiền mặt và VNPay.

Luồng tạo phiếu xuất:

```text
[Invoice PAID]
    |
    v
[Begin Transaction]
    |
    v
1. Đọc invoice.services_snapshot
2. Với mỗi service trong invoice:
   - Lấy BOM trong service_materials theo service_id
   - Gom danh sách vật liệu cần xuất
3. Tạo một bản ghi stock_issues:
   - issue_type = "SERVICE"
   - invoice_id = <invoice._id>
   - booking_id = invoice.booking_id
   - items = danh sách vật liệu đã gom
   - total_cost_amount = sum(items.subtotal_cost)
   - created_by = "SYSTEM"
4. Trừ materials.stock_quantity theo từng item
5. Kiểm tra ngưỡng tồn kho thấp
    |
    v
[Commit Transaction]
```

Một invoice chỉ có một `stock_issues`. Cách này giúp truy vấn từ invoice sang phiếu xuất đơn giản hơn, audit gọn hơn và tránh tạo nhiều bản ghi nhỏ cho cùng một lần thanh toán.

Lưu ý về transaction:

- MongoDB transaction yêu cầu replica set. Atlas sandbox đã hỗ trợ sẵn.
- Nếu chạy local bằng Docker, cần bật replica set một node hoặc dùng logic bù trừ.
- Nếu transaction lỗi giữa chừng, toàn bộ thao tác rollback: invoice không chuyển trạng thái hoàn tất, không tạo phiếu xuất và không trừ kho.

Các loại phiếu xuất khác có thể bổ sung ở giai đoạn sau:

- `DAMAGE`: vật liệu hỏng hoặc đổ vỡ, bắt buộc nhập `reason`.
- `ADJUSTMENT`: điều chỉnh sau kiểm kê.
- `EXPIRED`: vật liệu hết hạn sử dụng.

#### 2.10.4. Chính sách giá vốn (`cost_per_unit`)

Khi xuất 30 ml tinh dầu Olive cho một ca massage, hệ thống cần biết giá vốn đang tính theo giá nhập nào. Ở phiên bản hiện tại, chọn cách tính theo giá nhập gần nhất.

- `cost_per_unit = materials.unit_price` tại thời điểm xuất kho.
- Cách này đơn giản và đủ dùng trong phạm vi đồ án.
- Điểm hạn chế là chưa phải FIFO hoặc LIFO chuẩn kế toán vì hệ thống chưa quản lý theo lô hàng.

Nếu cần làm FIFO ở giai đoạn sau, có thể thêm collection `material_lots`. Mỗi phiếu nhập tạo một lô, khi xuất thì trừ theo thứ tự nhập trước xuất trước. Cách này đúng hơn về kế toán nhưng phức tạp hơn nhiều, nên chưa đưa vào phạm vi đồ án.

#### 2.10.5. Truy vấn audit

Lý do giữ collection `stock_issues` là để truy vấn hai chiều: từ invoice xem đã xuất gì, và từ vật liệu xem đã được xuất khi nào.

Truy vấn 1: "Invoice X đã xuất những vật liệu gì?"

```javascript
db.stock_issues.findOne({ invoice_id: ObjectId("...") })
// Trả về phiếu xuất với danh sách items đầy đủ
```

Truy vấn 2: "Vật liệu Y đã bị xuất khi nào?"

```javascript
db.stock_issues.find({ "items.material_id": ObjectId("...") })
  .sort({ issue_date: -1 })
// Trả về lịch sử xuất kho của vật liệu Y
```

Truy vấn 3: "Tính giá vốn cho báo cáo lợi nhuận tháng X"

```javascript
db.stock_issues.aggregate([
  { $match: { issue_date: { $gte: startOfMonth, $lte: endOfMonth }, issue_type: "SERVICE" } },
  { $group: { _id: null, totalCOGS: { $sum: "$total_cost_amount" } } }
])
// Tổng giá vốn xuất kho cho dịch vụ trong tháng
```

Truy vấn 4: "Invoice nào đã có stock_issue rồi?"

```javascript
// Index unique partial: { invoice_id: 1 } where issue_type = "SERVICE"
// Đảm bảo một invoice không sinh hai phiếu xuất trùng nhau
```

#### 2.10.6. Ba loại tổng tiền trong nghiệp vụ kho

| Collection | Field | Ý nghĩa | Nhóm nghiệp vụ |
|---|---|---|---|
| `stock_receipts` | `total_purchase_amount` | Tiền nhập trả nhà cung cấp, tính theo giá nhập x số lượng | Chi phí mua hàng |
| `stock_issues` | `total_cost_amount` | Giá vốn xuất kho, tính theo cost x số lượng | COGS |
| `invoices` | `total_material_amount` | Tiền vật liệu khách trả, tính theo giá bán x số lượng | Doanh thu vật liệu |

Công thức lợi nhuận vật liệu:

```text
profit_material = total_material_amount - total_cost_amount
```

Ba con số trên phục vụ ba mục đích khác nhau. Đặt tên riêng giúp tránh nhầm khi viết báo cáo và query.

### 2.11. Quản lý nhân viên và xác thực

Phần này quản lý vòng đời nhân viên từ lúc tạo tài khoản, đăng nhập, đổi mật khẩu, khóa tài khoản đến xóa mềm. Điểm quan trọng là tách rõ trạng thái làm việc của nhân viên và trạng thái tài khoản đăng nhập.

#### 2.11.1. Vai trò và quyền hạn

Hệ thống có 4 vai trò. Ở phiên bản hiện tại không tách riêng vai trò nhân sự hoặc thủ kho; các nghiệp vụ quản lý tập trung ở `ADMIN`.

| Role | Tên gọi | Trách nhiệm chính |
|---|---|---|
| `ADMIN` | Quản lý | Quản lý kho, dashboard tài chính, CRUD nhân viên, cấu hình hệ thống, payroll và các quyết định nghiệp vụ chính |
| `RECEPTIONIST` | Lễ tân | Tạo booking, check-in khách, quản lý hàng đợi |
| `CASHIER` | Thu ngân | Tạo invoice, thu tiền, in bill |
| `STAFF` | Nhân viên | Thực hiện dịch vụ và cập nhật trạng thái booking của mình |

#### 2.11.2. Hai loại trạng thái của nhân viên

Schema `staff` có hai field trạng thái độc lập.

`work_status` mô tả tình trạng làm việc:

| Giá trị | Ý nghĩa |
|---|---|
| `ACTIVE` | Đang làm việc bình thường |
| `ON_LEAVE` | Tạm nghỉ, ví dụ nghỉ thai sản, nghỉ ốm dài ngày hoặc đi học |
| `RESIGNED` | Đã nghỉ việc |

`account_status` mô tả trạng thái tài khoản đăng nhập:

| Giá trị | Ý nghĩa | Đăng nhập được? |
|---|---|---|
| `ACTIVE` | Tài khoản hoạt động bình thường | Có |
| `LOCKED` | Tài khoản bị khóa bởi admin | Không |
| `DELETED` | Tài khoản đã xóa mềm sau thời gian khóa | Không |

Quy tắc đăng nhập chỉ kiểm tra `account_status === ACTIVE`, không kiểm tra `work_status`.

Ví dụ, nhân viên đang `ON_LEAVE` vẫn có thể đăng nhập để xem lương hoặc lịch sử làm việc. Ngược lại, một nhân viên vẫn đang làm việc nhưng bị nghi ngờ rủi ro bảo mật thì admin có thể khóa tài khoản bằng `account_status = LOCKED`.

#### 2.11.3. Luồng đăng nhập

```text
User nhập email + password
|
v
Backend tìm staff theo email
|
v
Backend chạy bcrypt.compare(password, password_hash)
|
v
Luôn compare kể cả khi user không tồn tại, dùng dummy hash để giảm rủi ro timing attack
|
v
Kiểm tra account_status
- LOCKED: từ chối
- DELETED: từ chối
- ACTIVE: cho đi tiếp
|
v
Generate JWT với payload { sub, email, role, mustChangePassword }
|
v
Trả về { user, accessToken }
|
v
Frontend đọc mustChangePassword và chuyển sang màn đổi mật khẩu nếu cần
```

Thông báo lỗi đăng nhập phải dùng chung một câu: "Email hoặc mật khẩu không đúng". Không trả lỗi riêng cho sai email, sai mật khẩu, tài khoản bị khóa hoặc đã xóa, để tránh lộ thông tin tài khoản.

#### 2.11.4. Đổi mật khẩu

Có hai luồng đổi mật khẩu.

Luồng người dùng tự đổi mật khẩu qua `POST /auth/change-password`:

1. User nhập `currentPassword` và `newPassword`.
2. Backend kiểm tra `currentPassword`.
3. Backend hash mật khẩu mới.
4. Cập nhật `password_hash` và đặt `must_change_password = false`.

Luồng admin reset mật khẩu qua `POST /employees/:id/reset-password`:

1. Admin reset mật khẩu nhân viên về mật khẩu mặc định hoặc mật khẩu mới.
2. Backend đặt `must_change_password = true`.
3. Lần đăng nhập tiếp theo, nhân viên bắt buộc đổi mật khẩu trước khi dùng hệ thống.

Cơ chế bắt buộc đổi mật khẩu:

- `MustChangePasswordGuard` chạy sau `JwtAuthGuard` và trước `RolesGuard`.
- Guard đọc `req.user.mustChangePassword` từ JWT payload.
- Nếu giá trị là `true`, hệ thống chặn mọi endpoint trừ `/auth/change-password` và `/auth/me`.
- Endpoint được phép đi qua cần đánh dấu bằng decorator `@SkipPasswordChange()`.

#### 2.11.5. Khóa và xóa tài khoản

##### Khóa tài khoản

Admin gọi `POST /employees/:id/lock`.

Backend cần kiểm tra:

- Nhân viên tồn tại.
- `account_status` hiện tại là `ACTIVE`.
- Admin không được khóa chính tài khoản của mình.

Sau đó cập nhật:

```text
account_status = LOCKED
locked_at = NOW
```

##### Mở khóa tài khoản

Admin gọi `POST /employees/:id/unlock`.

Backend kiểm tra tài khoản đang ở trạng thái `LOCKED`, sau đó cập nhật:

```text
account_status = ACTIVE
locked_at = null
```

##### Xóa mềm sau 30 ngày khóa

Admin gọi `DELETE /employees/:id`.

Điều kiện xóa:

- Tài khoản phải đang `LOCKED`.
- Thời gian khóa phải đủ `ACCOUNT_DELETE_AFTER_LOCK_DAYS`, mặc định 30 ngày.
- Admin không được xóa chính mình.

Khi xóa mềm:

```text
account_status = DELETED
email = ${original_email}.deleted.${timestamp}
```

Không xóa vật lý bản ghi nhân viên vì `staff` đang được tham chiếu ở nhiều nơi như `bookings.staff_id`, `stock_receipts.created_by`, `payrolls.staff_id` và `services_snapshot.staff_id` trong invoice. Nếu hard delete, các báo cáo lịch sử có thể bị vỡ dữ liệu.

#### 2.11.6. Seed admin đầu tiên

Hệ thống cần ít nhất một tài khoản `ADMIN` để bắt đầu vận hành. Vì endpoint tạo nhân viên yêu cầu `@Roles('ADMIN')`, không thể tự đăng ký admin đầu tiên từ giao diện.

Giải pháp là dùng script seed:

```bash
npm run seed:admin
```

Script đọc thông tin từ `.env`:

```text
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
SEED_ADMIN_FULL_NAME
SEED_ADMIN_PHONE
```

Script phải idempotent: nếu admin đã tồn tại thì bỏ qua, không tạo trùng.

#### 2.11.7. Các lựa chọn trong phạm vi hiện tại

| Vấn đề | Lựa chọn hiện tại | Ghi chú |
|---|---|---|
| Thu hồi JWT | Stateless, không blacklist token | Nếu tài khoản bị khóa, token cũ vẫn có thể sống tới khi hết hạn. Phạm vi hiện tại chấp nhận mức này |
| Refresh token | Chưa làm | User đăng nhập lại sau khi access token hết hạn |
| Forgot password | Admin reset thủ công | Không cần tích hợp email service |
| Username | Dùng email | Đơn giản, dễ quản lý cho hệ thống nội bộ |
| Audit log | Chưa làm | Có thể bổ sung sau để biết ai reset mật khẩu, ai khóa tài khoản |

## 3. Indexes cần tạo

```text
customers:           phone (unique)
staff:               email (unique), account_status, work_status, (account_status, locked_at) compound
services:            code (unique)
materials:           code (unique)
suppliers:           không bắt buộc unique
stock_receipts:      receipt_code (unique), supplier_id, receipt_date
stock_issues:        issue_code (unique),
                     invoice_id (unique partial, chỉ áp dụng khi issue_type = "SERVICE"),
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

Index riêng cho `stock_issues`:

- `invoice_id` unique partial, chỉ áp dụng khi `issue_type = "SERVICE"`.
- Mục đích là đảm bảo một invoice không tạo hai phiếu xuất kho trùng nhau.
- Điều kiện partial là cần thiết vì các loại phiếu như `DAMAGE` hoặc `ADJUSTMENT` có thể không có `invoice_id`.

## 4. Cấu trúc embed tham khảo

### 4.1. `invoices.services_snapshot`

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

### 4.2. `invoices.materials_snapshot`

```jsonc
{
  "material_id": "ObjectId",
  "material_name": "Tinh dầu Olive",
  "unit_price": 8000,          // giá bán cho khách
  "quantity": 30,
  "unit": "ml",
  "subtotal": 240000           // unit_price x quantity
}
```

### 4.3. `stock_receipts.items`

```jsonc
{
  "material_id": "ObjectId",
  "material_code": "MAT-OLI-001",      // snapshot tại thời điểm nhập
  "material_name": "Tinh dầu Olive",   // snapshot
  "quantity": 5,                       // 5 lít nhập về
  "unit": "lít",
  "unit_price": 200000,                // giá nhập 200.000đ/lít
  "subtotal": 1000000,                 // unit_price x quantity
  "notes": "Lô sản xuất 03/2025"
}
```

### 4.4. `stock_issues.items`

```jsonc
{
  "material_id": "ObjectId",
  "material_code": "MAT-OLI-001",      // snapshot
  "material_name": "Tinh dầu Olive",   // snapshot
  "quantity": 30,                      // số lượng xuất theo BOM
  "unit": "ml",
  "cost_per_unit": 6667,               // giá vốn gần đúng theo giá nhập mới nhất
  "subtotal_cost": 200000,             // quantity x cost_per_unit
  "service_id": "ObjectId",
  "service_name": "Massage Đá Nóng",
  "notes": "Theo BOM"
}
```

### 4.5. `commission_configs.seniority_tiers`

```jsonc
[
  { "min_years": 0, "max_years": 1, "bonus_per_session": 0 },
  { "min_years": 1, "max_years": 3, "bonus_per_session": 10000 },
  { "min_years": 3, "max_years": 99, "bonus_per_session": 25000 }
]
```

### 4.6. `payrolls.commission_details`

```jsonc
{
  "booking_id": "ObjectId",
  "service_name": "Massage Đá Nóng",
  "session_date": "2025-05-15",
  "session_index": 23,      // ca thứ 23 trong tháng, cộng dồn tất cả dịch vụ
  "c_base": 80000,
  "c_kpi": 0,               // chưa vượt ngưỡng KPI
  "c_seniority": 25000,     // thâm niên từ 3 năm trở lên
  "total": 105000
}
```

## 5. Tổng quan collections

| # | Collection | Mục đích | Ghi chú nghiệp vụ kho |
|---|---|---|---|
| 1 | `customers` | Khách hàng, định danh bằng số điện thoại | |
| 2 | `staff` | Nhân viên và thông tin đăng nhập | `created_by` cho phiếu nhập, phiếu xuất |
| 3 | `services` | Dịch vụ spa, thời lượng, buffer, giá bán | |
| 4 | `materials` | Vật liệu kho | Theo dõi `stock_quantity` realtime |
| 5 | `suppliers` | Nhà cung cấp | Được tham chiếu từ `stock_receipts` |
| 6 | `service_materials` | BOM của dịch vụ | Định mức tiêu hao và khấu hao |
| 7 | `commission_configs` | Cấu hình hoa hồng | |
| 8 | `staff_services` | Gắn nhân viên với dịch vụ, lưu thâm niên | |
| 9 | `bookings` | Lịch đặt dịch vụ | Có thể gom nhóm bằng `booking_group_code` |
| 10 | `otp_verifications` | OTP xác nhận booking | Phác thảo cho giai đoạn sau |
| 11 | `invoices` | Hóa đơn và thanh toán | Khi `PAID` sẽ kích hoạt xuất kho |
| 12 | `payment_logs` | Log thanh toán | Dùng để kiểm tra callback và chữ ký VNPay |
| 13 | `stock_receipts` | Phiếu nhập kho | Cộng tồn kho, lưu giá nhập |
| 14 | `stock_issues` | Phiếu xuất kho | Trừ tồn kho, lưu giá vốn |
| 15 | `payrolls` | Lương và hoa hồng | Tính theo tháng |
| 16 | `operational_costs` + logs | Chi phí vận hành | Tách riêng với BOM |
