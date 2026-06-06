 
## 📁 Cấu trúc thư mục
 
```
backend/                                  # Thư mục này trong repo cha spa-management
│
├── src/
│   │
│   ├── main.ts                           # Entry point — bootstrap NestJS app, Swagger setup
│   ├── app.module.ts                     # Root module — import DatabaseModule + feature modules
│   │
│   ├── config/                           # Cấu hình đọc từ .env qua ConfigService
│   │   ├── app.config.ts                 # Port, CORS, global prefix
│   │   ├── database.config.ts            # MongoDB URI (dùng forRootAsync + ConfigService)
│   │   └── jwt.config.ts                 # JWT secret, expiry
│   │
│   ├── common/                           # Utilities dùng chung — không thuộc nghiệp vụ nào
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts # Lấy user từ JWT payload trong controller
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Bắt exception → format về ApiErrorResponse chuẩn
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts   # Wrap mọi response vào ApiResponse<T> envelope
│   │   └── pipes/
│   │       └── parse-objectid.pipe.ts    # Validate param :id là ObjectId hợp lệ
│   │
│   ├── shared/                           # Constants & error codes dùng chung toàn app
│   │   │                                 # ⚠️ KHÔNG chứa TypeScript interface/type
│   │   │                                 # Types được FE tự generate từ swagger.json
│   │   └── constants/
│   │       ├── error-codes.ts            # ERROR_CODES constants
│   │       └── business-rules.ts         # MAX_BOOKING_PER_DAY, BOOKING_BUFFER_MINUTES, v.v.
│   │
│   └── modules/                          # Feature modules — 1 folder = 1 nghiệp vụ
│       │
│       ├── health/                       # Health check endpoint cho monitoring
│       │   ├── health.module.ts
│       │   ├── health.controller.ts      # GET /health
│       │   └── health.service.ts
│       │
│       ├── auth/                         # Xác thực
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts        # POST /auth/login  POST /auth/refresh
│       │   ├── auth.service.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       └── auth-response.dto.ts  # @ApiProperty → xuất hiện trong swagger.json
│       │
│       ├── customer/                     # Quản lý khách hàng
│       │   ├── customer.module.ts
│       │   ├── customer.controller.ts
│       │   ├── customer.service.ts
│       │   ├── customer.schema.ts        # Mongoose Schema → collection 'customers'
│       │   └── dto/
│       │       ├── create-customer.dto.ts
│       │       └── customer-response.dto.ts
│       │
│       ├── booking/                      # Đặt lịch — nghiệp vụ phức tạp nhất
│       │   ├── booking.module.ts
│       │   ├── booking.controller.ts
│       │   ├── booking.service.ts
│       │   ├── booking.schema.ts
│       │   ├── slot-lock.service.ts      # Xử lý race condition khi nhiều người đặt cùng lúc
│       │   └── dto/
│       │       ├── create-booking.dto.ts
│       │       ├── update-booking-status.dto.ts
│       │       └── booking-response.dto.ts
│       │
│       ├── spa-service/                  # Dịch vụ spa
│       │   │                             # ⚠️ Tên 'spa-service' (không phải 'service')
│       │   │                             # để tránh nhầm với khái niệm NestJS service
│       │   ├── spa-service.module.ts
│       │   ├── spa-service.controller.ts
│       │   ├── spa-service.service.ts
│       │   ├── spa-service.schema.ts
│       │   └── dto/
│       │
│       ├── employee/                     # Nhân viên + phân quyền dịch vụ
│       │   ├── employee.module.ts
│       │   ├── employee.controller.ts
│       │   ├── employee.service.ts
│       │   ├── employee.schema.ts
│       │   └── dto/
│       │
│       ├── invoice/                      # Hóa đơn thanh toán
│       │   ├── invoice.module.ts
│       │   ├── invoice.controller.ts
│       │   ├── invoice.service.ts
│       │   ├── invoice.schema.ts
│       │   └── dto/
│       │
│       ├── inventory/                    # Kho vật liệu + nhà cung cấp
│       │   ├── inventory.module.ts
│       │   ├── inventory.controller.ts
│       │   ├── inventory.service.ts
│       │   ├── material.schema.ts
│       │   ├── supplier.schema.ts
│       │   ├── import-invoice.schema.ts  # Phiếu nhập kho
│       │   └── dto/
│       │
│       └── report/                       # Báo cáo & thống kê
│           ├── report.module.ts
│           ├── report.controller.ts
│           └── report.service.ts         # Dùng MongoDB Aggregation Pipeline
│
├── database/                             # Seed data & Docker init script
│   │                                     # ⚠️ KHÔNG chứa Mongoose schema (schema nằm trong modules/)
│   ├── seeds/
│   │   ├── 01-spa-services.seed.ts
│   │   ├── 02-employees.seed.ts
│   │   ├── 03-materials.seed.ts
│   │   └── run-seeds.ts
│   └── mongo-init.js                     # Chạy tự động khi Docker MongoDB khởi động lần đầu
│
├── test/
│   ├── booking.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                                  # ❌ KHÔNG COMMIT — chứa secrets
├── .env.example                          # ✅ COMMIT — template cho thành viên
├── docker-compose.yml                    # Chạy MongoDB local
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```
 
---
 
## 🔄 Tích hợp với Frontend — OpenAPI Contract Flow
 
BE (TypeScript 5.x) và FE (TypeScript 4.x) **không tương thích để share type trực tiếp**. Contract được trao đổi qua **OpenAPI/Swagger**:
 
```
BE (NestJS)                              FE (Umi 4)
│                                            │
│  @ApiProperty trên DTO                     │
│  ↓                                         │
│  @nestjs/swagger tự động generate          │
│  ↓                                         │
│  swagger.json  ─────────────────────────→  │  npm run openapi
│  (tại /api-docs-json)                      │  ↓
│                                            │  src/services/spa-api/
│                                            │  ├── typings.d.ts  ← types
│                                            │  └── *.ts          ← API functions
```
 
**Quy tắc vận hành:**
- BE thêm `@ApiProperty()` đầy đủ trên **mọi** DTO field — đây là nguồn sự thật duy nhất
- FE **không tự viết type** — chỉ chạy `npm run openapi` để sync
- Mỗi khi BE thay đổi API → commit phải ghi rõ thay đổi contract để FE biết cần re-generate
 
---
 
## ⚙️ Yêu cầu hệ thống
 
| Công cụ | Phiên bản |
|---|---|
| Node.js | **24 LTS** |
| npm | >= 9.x |
 
> Dùng `fnm` để quản lý Node version: `fnm use 24`
 
---
 
## 🚀 Cách chạy server
 
### 1. Vào thư mục backend & cài dependencies
 
```bash
# Từ root của repo cha
cd backend
npm install
```
 
### 2. Cấu hình biến môi trường
 
```bash
cp .env.example .env
# Mở .env — chỉ cần sửa MONGODB_URI nếu dùng MongoDB Atlas
```
 
`.env.example`:
 
```env
PORT=8000
NODE_ENV=development
 
# MongoDB Atlas — share cả team
# MONGODB_URI=mongodb+srv://khang-vu:<pass>@cluster.mongodb.net/dev?retryWrites=true&w=majority
 
```
 
### 3. Chạy server
 
```bash
# Development — tự động reload khi sửa code
npm run start:dev
```
 
| Địa chỉ | Mô tả |
|---|---|
| http://localhost:3000/api/v1 | REST API |
| http://localhost:3000/api-docs | Swagger UI — xem và test API |
| http://localhost:3000/api-docs-json | swagger.json — FE dùng để generate types |
 
---
 
## 📦 Lệnh thường dùng
 
```bash
npm run start:dev       # Dev với hot-reload
npm run build           # Build production
npm run test            # Unit tests
npm run test:e2e        # E2E tests
npm run lint            # Kiểm tra linting
npm run format          # Format code với Prettier
npm run seed            # Chạy seed data
 
# Tạo NestJS resource mới (module + controller + service + dto cùng lúc)
npx nest g resource modules/<tên-module> --no-spec
```
 
---
 
## 📌 Lưu ý khi code BE
 
- **Không commit `.env`** — secrets không lên GitHub
- **Luôn thêm `@ApiProperty()`** trên mọi DTO field — FE phụ thuộc vào đây để generate types
- **Thông báo FE** mỗi khi thay đổi API contract để Công chạy lại `npm run openapi`
- **Schema nằm cùng module** — `booking.schema.ts` ở trong `booking/`, không tách ra ngoài
- **Tên folder `spa-service`** (không phải `service`) — tránh nhầm với NestJS service concept
 