---
name: spa-backend-pr-review
description: Use this skill to REVIEW a pull request, AUDIT an existing module, or CHECK whether code in the Spa Management System backend follows team conventions. Specific actions covered — running through a structured checklist on Module/DI architecture, Mongoose schema correctness (snake_case↔camelCase mapping, indexes, soft delete), DTO completeness (4 DTOs, @ApiProperty coverage), service patterns (mapToResponse, error codes from shared/), controller patterns (@ApiTags, ParseObjectIdPipe, no manual response wrapping), JWT/security config, validation pipeline, and performance traps. Trigger phrases (Vietnamese + English): "review PR #X", "review code", "audit module X", "kiểm tra code", "check module", "review module", "code review for", "audit existing", "PR này có đúng convention không", "module này ổn chưa", "soi code". Use AFTER code has been written — typically when Vu reviews Khánh's PR, when auditing legacy modules, or when self-checking before submitting a PR. Do NOT use this skill for writing new code — use `spa-backend-module-pattern` instead.
---

# Spa Backend PR Review

Skill này cung cấp checklist có cấu trúc để review PR / audit module trong dự án Spa Management System backend (NestJS + MongoDB).

> ⚠️ **NGUYÊN TẮC NỀN:** Checklist này áp dụng cho code đã viết xong, KHÔNG phải lúc đang code. Nếu đang code → dùng skill `spa-backend-module-pattern`.

---

## Project context recap

- **Stack:** NestJS, Node 24 LTS, TypeScript 5.x, MongoDB (Mongoose), `@nestjs/swagger`
- **Convention nguồn:** `CODING_CONVENTION.md` (project root) là source of truth cho naming/style.
- **OpenAPI contract:** FE consumes types từ `swagger.json` qua `umi openapi`. Mọi DTO field thiếu `@ApiProperty()` sẽ làm vỡ FE — đây là failure mode quan trọng nhất phải catch khi review.
- **Foundation Layer** (`common/` + `shared/`) đã có sẵn — PR không được override, chỉ extend.

---

## Workflow review chuẩn

### Bước 1 — Đọc Issue link với PR
- Xác nhận PR description trả lời 3 câu của `CONTRIBUTING.md`: **Làm gì / Tại sao / Checklist test**.
- Đối chiếu scope của PR với Issue: PR có làm thêm thứ ngoài Issue không? (out-of-scope = bad)
- Nếu PR khác `MODULE_SPECS.md`, kiểm tra description có ghi rõ lý do không.

### Bước 2 — Chạy local test trước khi đọc code
1. Pull branch về local
2. `npm run build` — fail = comment ngay, không cần đọc code
3. `npm run start:dev` — verify Swagger UI render được DTO mới
4. Test bằng Postman: 5 endpoint CRUD cơ bản phải work
5. Verify response shape qua interceptor: `{ success: true, data: ..., meta?: ... }`

### Bước 3 — Đi qua checklist theo thứ tự bên dưới

Đi từ ngoài vào trong: **Module structure → Schema → DTO → Service → Controller → Security → Performance**.

Mỗi mục check có 3 trạng thái:
- ✅ Pass — đúng convention
- ⚠️ Suggest — không sai nhưng nên cải thiện (comment, không block merge)
- ❌ Block — sai convention/sai bug, phải sửa trước khi merge

---

## Checklist 1 — Module Architecture & DI

- [ ] Tất cả `Service` đều có `@Injectable()`
- [ ] Mọi provider được dùng cross-module đều nằm trong `exports: [...]` của module file
- [ ] **`exports: [MongooseModule]`** có mặt nếu module khác cần inject Model — xem `CODING_CONVENTION.md` mục 3.1
- [ ] Không có circular dependency mới được tạo ra. Nếu có dùng `forwardRef()` → reviewer phải hỏi: "tại sao không refactor lại boundary thay vì forwardRef?"
- [ ] Module boundary follow domain — không có module nào lẫn lộn 2 domain (vd: customer logic không được nằm trong `booking/`)
- [ ] Cross-module communication qua **Service**, KHÔNG qua inject Model trực tiếp của module khác
- [ ] Custom provider dùng injection token rõ ràng (Symbol/class), tránh string token

**Common pitfalls cần soi:**
- Khánh hay quên `exports: [MongooseModule]` → InvoiceModule muốn inject `MaterialModel` sẽ crash runtime
- Khi module có nhiều collection (vd `inventory`), forget add 1 controller/service vào `inventory.module.ts`

---

## Checklist 2 — Mongoose Schema

- [ ] File schema đặt **flat** trong module folder, KHÔNG trong subfolder `schemas/`
- [ ] Class name **PascalCase** (`Material`), file name **kebab-case** (`material.schema.ts`)
- [ ] **`@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })`** — bắt buộc override để khớp snake_case convention. Mongoose default là camelCase trong DB → vi phạm.
- [ ] **TS field name LUÔN là camelCase**, mapping sang snake_case qua `@Prop({ name: 'snake_case_name' })`
- [ ] Indexes declared SAU `SchemaFactory.createForClass()` bằng `<Entity>Schema.index({...})`, KHÔNG inline trong `@Prop`
- [ ] Reference fields dùng `MongooseSchema.Types.ObjectId + ref: 'EntityName'`
- [ ] Embed structures dùng sub-schema với `_id: false`
- [ ] Soft delete dùng `isActive: boolean` (default `true`), KHÔNG dùng `deletedAt` hay hard delete
- [ ] Decision **embed vs reference** đúng nguyên tắc snapshot: dữ liệu lúc-thanh-toán (giá, tên service tại thời điểm ghi nhận) → embed; entity có lifecycle độc lập → reference
- [ ] Field `created_at?: Date` và `updated_at?: Date` được khai báo trong class để TypeScript biết (auto-managed bởi Mongoose timestamps option)

**Common pitfalls cần soi:**
- Quên `name: 'snake_case'` → Mongo lưu camelCase → khi query bằng MongoDB Compass nhìn lệch convention
- Dùng `populate()` cho dữ liệu snapshot (giá tại thời điểm thanh toán) → giá thay đổi sau làm sai báo cáo doanh thu
- Hard delete bằng `deleteOne()` thay vì update `isActive: false`

---

## Checklist 3 — DTO Pattern

- [ ] Có đủ **4 DTO**: `create-X.dto.ts`, `update-X.dto.ts`, `query-X.dto.ts`, `X-response.dto.ts`
- [ ] **MỌI** field trong DTO đều có `@ApiProperty()` hoặc `@ApiPropertyOptional()` — thiếu = FE openapi gen fail
- [ ] `UpdateXxxDto` extends `PartialType(CreateXxxDto)` từ `@nestjs/swagger`, KHÔNG từ `@nestjs/mapped-types`
- [ ] `QueryXxxDto` có pagination: `page`, `limit` với `@Type(() => Number)` (vì query string là string), `DEFAULT_PAGE`/`DEFAULT_LIMIT`/`MAX_LIMIT` import từ `shared/constants/business-rules`
- [ ] `XxxResponseDto` chỉ chứa camelCase fields — KHÔNG expose `_id`, `__v`, `created_at` (snake_case)
- [ ] `class-validator` decorators có `message` tiếng Việt
- [ ] Validation cho money: `@IsInt() @Min(0)` (VND không có decimal)
- [ ] Validation cho phone VN: `@Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải đủ 10 chữ số' })`
- [ ] Validation cho ObjectId: `@IsMongoId()` (dùng cho field reference trong body, KHÔNG dùng cho path param — path param dùng `ParseObjectIdPipe`)

**Common pitfalls cần soi:**
- Field thêm vào schema nhưng quên thêm vào DTO → Mongoose strict mode silently drop
- `@ApiProperty` thiếu `enum: XxxEnum` cho enum field → FE generated type bị `string` thay vì union
- `QueryXxxDto.isActive` để type `boolean` thay vì `string` (`@IsBooleanString`) → vỡ vì query string luôn là string

---

## Checklist 4 — Service Pattern

- [ ] Inject Model qua `@InjectModel(Entity.name)`, KHÔNG inject Model của module khác
- [ ] Có **`private mapToResponse(doc: XxxDocument): XxxResponseDto`** method
- [ ] CRUD methods LUÔN return qua `mapToResponse()` — không return raw Mongoose document
- [ ] Error throw bằng `NotFoundException`/`ConflictException`/`BadRequestException` với object shape: `{ code: ERROR_CODES.X, message: 'tiếng Việt' }`
- [ ] Error code import từ `shared/constants/error-codes.ts`, KHÔNG hardcode string
- [ ] Service KHÔNG validate input — class-validator ở DTO đã handle
- [ ] Service KHÔNG wrap response (`{ success: true, data: ... }`) — ResponseInterceptor làm rồi
- [ ] Public service methods có **JSDoc** (description, `@param`, `@returns`, `@throws`). Private methods không cần.
- [ ] `findAll()` dùng `Promise.all([find, countDocuments])` để parallel, không sequential
- [ ] Soft delete trong `remove()` dùng `findByIdAndUpdate(id, { is_active: false })` — chú ý query field là **snake_case** vì query trên DB layer
- [ ] Không có `console.log` — dùng `Logger`
- [ ] Không có `try/catch` không cần thiết — exception filter handle

**Common pitfalls cần soi:**
- Trong `findAll`, filter dùng `{ isActive: ... }` (camelCase) → Mongoose không tìm ra vì DB lưu `is_active`
- Service inject `MaterialModel` từ InventoryModule trực tiếp thay vì qua `MaterialService.findById()` — vi phạm encapsulation, khó test
- Validate trong service kiểu `if (!dto.code) throw...` → trùng với class-validator, dead code

---

## Checklist 5 — Controller Pattern

- [ ] `@ApiTags('ResourceName')` trên class
- [ ] `@ApiOperation({ summary: '...' })` trên mỗi method (tiếng Việt)
- [ ] Path param ID dùng `@Param('id', ParseObjectIdPipe)` — KHÔNG dùng `@IsMongoId` ở body
- [ ] Method TRẢ VỀ DATA RAW từ service — KHÔNG wrap `{ success: true, ... }` (ResponseInterceptor làm)
- [ ] Resource path là **plural** (`@Controller('materials')`, `@Controller('bookings')`)
- [ ] HTTP verb đúng REST convention: GET (list/detail), POST (create), PATCH (partial update), DELETE (remove)
- [ ] Không có business logic trong controller — chỉ delegate sang service
- [ ] Không có `@HttpCode()` thừa — để default trừ khi cần thay đổi (vd: 204 cho delete)

**Common pitfalls cần soi:**
- Manual wrap response trong controller → bị double-wrap khi qua ResponseInterceptor → FE parse fail
- Quên `ParseObjectIdPipe` → ID sai format trả 500 thay vì 400
- Dùng `@Body() id: string` cho update path → conflict với param

---

## Checklist 6 — Authentication & Security (JWT + Passport)

- [ ] JWT strategy import từ `passport-jwt`, KHÔNG self-implement
- [ ] `JwtModule.register()` secret = `JwtStrategy.secretOrKey` (cùng đọc từ `ConfigService`)
- [ ] Authorization header format: `Bearer <token>`
- [ ] Token expiration phù hợp: access token ngắn (15m-1h), refresh token dài (7d-30d)
- [ ] `JWT_SECRET` không có default value trong code — bắt buộc set qua env
- [ ] `.env` KHÔNG được commit; `.env.example` có và đầy đủ keys
- [ ] OTP code không log ra console hoặc save plain text — phải hash hoặc TTL ngắn
- [ ] Endpoints sensitive (payroll, report) có `@UseGuards(JwtAuthGuard)` và role check
- [ ] Public endpoint (booking, OTP) có `@Public()` decorator rõ ràng để guard biết skip

**Common pitfalls cần soi:**
- Hardcode JWT secret trong source — leak key
- Quên `@UseGuards()` cho admin endpoint → leak data
- Bcrypt round quá thấp (<10) cho password
- Verify VNPay signature dùng string compare thay vì bcrypt-style timing-safe compare

---

## Checklist 7 — Request Lifecycle & Validation

- [ ] Global pipes/interceptors KHÔNG bị bypass bởi manual wrap
- [ ] DTO validation chạy được — verify bằng test request invalid data, expect 400 với message tiếng Việt
- [ ] Exception filter handle tất cả error consistently — verify bằng error response shape: `{ success: false, error: { code, message, details? } }`
- [ ] Custom decorator (vd: `@CurrentUser()`) hoạt động trong context có guard
- [ ] Pipe order đúng: ParseObjectIdPipe trước ValidationPipe nếu dùng cả 2

**Lifecycle reminder để debug:**
```
Middleware → Guards → Interceptors (before) → Pipes → Route handler → Interceptors (after) → Exception filter
```

---

## Checklist 8 — Performance & Maintainability

- [ ] Không có `console.log` trong code commit — dùng `Logger`
- [ ] Operation đắt (aggregate, populate sâu) có index hỗ trợ — verify qua `.explain('executionStats')`
- [ ] Query filter không scan unbounded — list endpoint phải có pagination
- [ ] N+1 query không xảy ra — populate đa cấp được justify hoặc thay bằng aggregate
- [ ] Heavy computation (commission tháng, report) cache hoặc batch — không tính realtime mỗi request
- [ ] String search (`$regex`) có index text hoặc giới hạn scope (vd: chỉ search trong active records)
- [ ] Bulk operation (insert nhiều material) dùng `insertMany()` thay vì loop `create()`

**Common pitfalls cần soi:**
- `findAll()` không pagination → list 10000 records → crash
- `populate()` 3 cấp lồng nhau (booking → customer → invoices → items) → query time tăng 100x
- `$regex` không anchor (`/abc/`) làm full collection scan

---

## Checklist 9 — Testing & Mocking (nếu PR có test)

- [ ] Test module dùng provider mock minimal — chỉ mock thứ thực sự cần
- [ ] KHÔNG có DB thật trong unit test — phải mock Model
- [ ] Mọi async đều `await` đầy đủ trong test
- [ ] `JwtService` và external service (VNPay, Email) đều mock
- [ ] Test cover cả happy path và error path (NotFound, Conflict)
- [ ] Test name rõ ràng: `should return 404 when material not found` thay vì `test 1`

---

## Checklist 10 — Git & PR Hygiene

- [ ] Branch name follow `CONTRIBUTING.md`: `feature/<issue-id>-<desc>`, `fix/...`, etc.
- [ ] Commit messages follow Conventional Commits với issue ID: `#17 feat(booking): implement otp verify flow`
- [ ] Thứ tự commit: `chore` → `docs` → `test` → `feat/fix` → `refactor` → `docs`
- [ ] PR đã rebase với `develop` trước khi merge
- [ ] PR description trả lời 3 câu: **Làm gì / Tại sao / Checklist test**
- [ ] Không có file `.env` bị commit nhầm
- [ ] Không có `node_modules/`, `dist/`, `*.log` trong PR
- [ ] Squash and merge để giữ history `develop` gọn

---

## When to stop and delegate

Reviewer không phải expert tất cả. Khi gặp các trường hợp sau, delegate hoặc hỏi đúng người:

- **TypeScript advanced types** (conditional types, mapped types, infer) → hỏi expert TS hoặc skip review depth
- **MongoDB aggregation/index optimization** → hỏi expert DB, đừng đoán
- **Node.js runtime tuning** (event loop, worker threads) → hỏi expert Node
- **FE concerns** (umi openapi gen output, React patterns) → bounce sang Công
- **Business logic phức tạp** (commission calc, slot availability) → đối chiếu trực tiếp với `MODULE_SPECS.md` và Issue, không tự suy luận

---

## Validation order khi reviewer test trước merge

```
1. Build pass        (npm run build)
2. Unit test pass    (npm run test)
3. Integration pass  (npm run test:e2e nếu có)
4. Smoke test bằng Postman cho 5 endpoint cơ bản
5. Verify Swagger UI render đầy đủ DTO
```

Bước nào fail = block merge ngay, không đọc tiếp.

---

## Reference files

- `CODING_CONVENTION.md` (project root) — Source of truth cho convention
- `CONTRIBUTING.md` (project root) — Git workflow, commit format, PR template
- `MODULE_SPECS.md` — Spec collections, business rules
- `backend/README.md` — Tổng quan backend
- `shared/constants/error-codes.ts` — Error code registry
- `shared/constants/business-rules.ts` — DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, etc.

---

## Skill liên quan

- **`spa-backend-module-pattern`** — Dùng khi VIẾT code module mới (scaffold, schema, DTO, service, controller). Skill này KHÔNG dùng cho việc đó — skill này là sau-khi-code.
