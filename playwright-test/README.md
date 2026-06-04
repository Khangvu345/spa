# E2E Tests — Luna Spa (Playwright)

Bộ kiểm thử end-to-end phủ toàn bộ module của hệ thống quản lý Luna Spa
(Auth, Dashboard, Khách hàng, Dịch vụ, Nhân viên, Bảng lương, Kho/Vật liệu/NCC,
Lịch hẹn, Lễ tân, Thu ngân, Phiếu dịch vụ).

## Yêu cầu

- **Node.js ≥ 18** (Playwright 1.60 không chạy trên Node 16).
  Máy đang để mặc định Node 16 — chuyển bằng `fnm`:
  ```powershell
  fnm use 20      # hoặc 18 / 24
  ```
- Frontend đang chạy (umi dev) + Backend NestJS đã seed dữ liệu mẫu.

## Cài đặt

```powershell
cd playwright-test
npm install
npx playwright install        # tải trình duyệt (chromium...)
```

## Cấu hình

Sao chép `.env.example` → `.env` và chỉnh lại nếu cần:

```ini
BASE_URL=http://localhost:8000
ADMIN_EMAIL=admin@spa.local
ADMIN_PASSWORD=Admin@123456
OPERATOR_EMAIL=operator@spa.local
OPERATOR_PASSWORD=Staff@123456
```

> `ADMIN_*` phải khớp `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` bạn dùng khi seed BE.

## Chạy backend + frontend trước

```powershell
# Terminal 1 — backend (seed nếu chưa có dữ liệu)
cd backend; npm run start:dev

# Terminal 2 — frontend
cd frontend; yarn start:dev      # mở http://localhost:8000
```

## Chạy test

```powershell
cd playwright-test

npx playwright test                 # chạy toàn bộ (headless)
npx playwright test --headed        # xem trình duyệt thao tác
npx playwright test --ui            # chế độ UI tương tác
npx playwright test auth            # chỉ nhóm Auth
npx playwright test admin/payroll   # chỉ Bảng lương
npx playwright show-report          # xem báo cáo HTML sau khi chạy
```

## Cách hoạt động

- Project **`setup`** (`tests/auth.setup.ts`) đăng nhập sẵn ADMIN + OPERATOR một
  lần, lưu phiên vào `playwright/.auth/*.json`. Các spec khác `test.use({ storageState })`
  để vào thẳng trang, không phải login lại từng test.
- Helper:
  - `tests/helpers/auth.ts` — tài khoản, đường dẫn storageState, hàm `login`.
  - `tests/helpers/ui.ts` — thao tác Ant Design (Select, Dropdown menu, bảng, modal).
- Kế hoạch chi tiết: [`specs/plan.md`](specs/plan.md).

## Lưu ý dữ liệu

Các test "tạo mới" ghi dữ liệu thật (tiền tố `E2E …` + timestamp). **Chỉ chạy trên
DB dev/test.** Một số test phụ thuộc dữ liệu (xem chi tiết phiếu lương, điều chỉnh
tồn kho…) sẽ tự `skip` khi bảng rỗng.

## Sinh / sửa test tự động (tuỳ chọn)

Repo có sẵn 3 agent Playwright MCP (`playwright-test-planner`, `-generator`,
`-healer`) để dò selector trên app thật và sinh/sửa test. Xem các file
`playwright-test-*.agent.md` ở gốc repo.
