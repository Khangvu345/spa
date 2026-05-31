# Module: PDF Export

> Living state document — cập nhật khi đóng session.

---

## Mô tả

Module PDF dùng chung cho backend, chịu trách nhiệm render file PDF từ dữ liệu đã có của Reports, Invoice và Payroll. Module này chỉ dựng chứng từ, không tính toán lại nghiệp vụ.

---

## Thành viên phụ trách

- **Chính:** Khang
- **Hỗ trợ:** —

---

## Liên kết

- **Code:** `src/modules/pdf/`
- **API spec:** Swagger tag `Reports & Dashboard`, `Invoices`, `Payrolls`
- **Related modules:** `reports`, `invoice`, `payroll`

---

## Hiện trạng (Current Snapshot)

### Endpoints đã implement qua module liên quan

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| GET | `/reports/revenue/export-pdf` | Xuất báo cáo doanh thu PDF | ADMIN |
| GET | `/invoices/:id/export-pdf` | Xuất hóa đơn PDF để xem/in bill | OPERATOR, ADMIN |
| GET | `/payrolls/:id/export-pdf` | Xuất phiếu lương PDF | JWT + ownership |

> Tất cả endpoint trả raw binary bằng `@Res()`, `Content-Type: application/pdf`, không wrap ApiResponse envelope.

### Service chính

- `PdfService.buildRevenuePdf(report)` — render báo cáo doanh thu theo kỳ, bảng breakdown dịch vụ, tổng doanh thu và số hóa đơn.
- `PdfService.buildInvoicePdf(invoice)` — render hóa đơn dịch vụ, thông tin khách, bảng items và tổng thanh toán.
- `PdfService.buildPayrollPdf(payroll)` — render phiếu lương, bảng hoa hồng theo dịch vụ và tổng thu nhập.

### Quyết định kỹ thuật quan trọng

- Dùng `pdfmake`, không dùng puppeteer/HTML to PDF để tránh phụ thuộc Chromium.
- Cấu hình Roboto từ `node_modules/pdfmake/fonts/Roboto` bằng `setFonts`, có `setLocalAccessPolicy` giới hạn chỉ đọc trong thư mục `pdfmake`.
- Chặn URL external bằng `setUrlAccessPolicy(() => false)` vì PDF hiện không cần tải ảnh/tài nguyên ngoài.
- Báo cáo doanh thu dùng `attachment`; hóa đơn và phiếu lương dùng `inline` để browser mở xem rồi in.
- Chỉ các field enum được normalize rồi dịch sang tiếng Việt: trạng thái hóa đơn, phương thức thanh toán, trạng thái phiếu lương, vai trò nhân viên (`admin`/`Admin` vẫn thành `Quản trị viên`, `operator` thành `Nhân viên vận hành`, `STAFF` thành `Chuyên viên`). Dữ liệu tên/người thực hiện trong bảng chi tiết dịch vụ giữ nguyên tên thật từ `item.staffName`, không dịch như role.
- Các field người thao tác trong chứng từ (`Người tạo`, `Người thu tiền`, `Người chốt`) dùng tên thật đã snapshot từ `currentUser.fullName`; email chỉ là fallback khi tài khoản thiếu tên.
- Lỗi render PDF được map về `PDF_GENERATION_FAILED`.

### Pending

- [x] Manual smoke test render PDF mẫu: báo cáo doanh thu 1 trang, báo cáo doanh thu 5 trang, hóa đơn, phiếu lương.
- [x] Manual smoke test file `*-vi.pdf`: trạng thái/phương thức thanh toán/role đã hiển thị tiếng Việt.
- [x] Manual smoke test bộ chốt field: `field-check-revenue-report.pdf`, `field-check-invoice-real-names.pdf`, `field-check-payroll-real-names.pdf`.
- [x] Controller unit test cover raw response headers, 403 ownership propagation, 404 not found propagation.
- [ ] FE thêm nút "In PDF" / "Tải PDF" gọi endpoint raw binary.
- [ ] Nếu sau này cần logo/branding, bổ sung ảnh local hoặc URL public có policy rõ ràng.

---

## Lịch sử log

| File | Ngày | Dev | Tóm tắt |
|---|---|---|---|
| [2026-05-30_001_Khang](2026-05-30_001_Khang.md) | 2026-05-30 | Khang | Tạo PdfModule/PdfService dùng pdfmake, gắn 3 endpoint export PDF cho báo cáo doanh thu, hóa đơn, phiếu lương |
