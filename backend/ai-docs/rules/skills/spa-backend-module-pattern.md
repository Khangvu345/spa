---
name: spa-backend-module-pattern
description: Use this skill to SCAFFOLD or IMPLEMENT a new NestJS module/feature in the Spa Management System backend. Specific actions covered — generating boilerplate via `nest g resource`, writing Mongoose schemas with snake_case↔camelCase mapping, creating the 4 standard DTOs (Create/Update/Query/Response) with `@ApiProperty` for OpenAPI, writing service CRUD methods with `mapToResponse()`, wiring controllers with `@ApiTags`/`ParseObjectIdPipe`, and configuring module files with `MongooseModule.forFeature` + exports. Trigger phrases (Vietnamese + English): "tạo module X", "scaffold module", "viết schema cho", "viết CRUD cho", "thêm DTO cho", "tạo controller cho", "implement issue #X", "build feature X", "create resource for X". Use BEFORE writing any backend code to ensure consistency with team conventions (NestJS CLI workflow, MongoDB embed/reference rules, response envelope, naming, snake_case ↔ camelCase mapping). Do NOT use this skill for reviewing existing code or auditing PRs — use `spa-backend-pr-review` instead.
---

# Spa Backend Module Pattern

Skill này encode toàn bộ convention của team Spa Management System cho backend NestJS + MongoDB.

> ⚠️ **NGUYÊN TẮC TỐI THƯỢNG:** Đọc và tuân thủ Issue cụ thể được giao. `MODULE_SPECS.md` chỉ là **tham khảo ý tưởng cốt lõi** — Issue mới là source of truth khi code. Nếu Issue và MODULE_SPECS mâu thuẫn → theo Issue, đề cập sự khác biệt trong PR description.

**Project context recap:**
- Stack: NestJS, Node 24 LTS, TypeScript 5.x, MongoDB (Mongoose), `@nestjs/swagger`
- FE consumes types via `umi openapi` from `swagger.json` (tại `/api-docs-json`). **Every DTO field MUST have `@ApiProperty()`** or FE breaks.
- Naming (theo `CODING_CONVENTION.md` mục 3.1): MongoDB lưu `snake_case`, BE TypeScript code dùng `camelCase`. Mapping qua `@Prop({ name: 'snake_case_name' })` option.
- Foundation Layer (`common/` + `shared/`) đã có sẵn — KHÔNG tạo lại.

---

## Workflow chuẩn cho mọi feature/module

### Bước 1 — Analyze the User-Provided Issue + MODULE_SPECS
⚠️ Note to AI: You cannot access external GitHub links. The User MUST provide the full text of the Issue or reference a local file in their prompt. 
- Read the provided Issue content carefully to understand the exact requirements.
- Read the relevant section in `MODULE_SPECS.md` to reference collections, fields, and business rules.
- Explicitly note any discrepancies between the Issue and `MODULE_SPECS.md` to discuss with Vu/Khánh.

### Bước 2 — `nest g resource` để tạo boilerplate

```bash
# Cú pháp chung
npx nest g resource modules/<module-name>/<entity-name> --no-spec

# Ví dụ: tạo customer (1 collection trong module customer)
npx nest g resource modules/customer --no-spec

# Ví dụ: tạo material trong inventory module
npx nest g resource modules/inventory/material --no-spec

# Khi prompt hỏi:
# - "What transport layer do you use?" → REST API
# - "Would you like to generate CRUD entry points?" → Yes
```

NestJS CLI tự sinh:
- `<entity>.module.ts`, `<entity>.controller.ts`, `<entity>.service.ts`
- `entities/<entity>.entity.ts` (sẽ rename thành schema)
- `dto/create-<entity>.dto.ts`, `dto/update-<entity>.dto.ts`
- 5 endpoint CRUD cơ bản

### Bước 3 — AI customize theo convention dự án

Sau khi có boilerplate, AI cần edit:
1. **Rename `entities/<entity>.entity.ts` → `<entity>.schema.ts`** (đặt flat trong module folder, KHÔNG trong subfolder)
2. **Replace nội dung schema** thành Mongoose schema theo template (xem section "Mongoose Schema Pattern")
3. **Update 4 DTO** với `@ApiProperty` + `class-validator`:
   - `create-<entity>.dto.ts` (đã có, edit)
   - `update-<entity>.dto.ts` (đã có dùng PartialType, kiểm tra)
   - **Thêm mới** `query-<entity>.dto.ts` (pagination + filter)
   - **Thêm mới** `<entity>-response.dto.ts` (camelCase, FE-facing)
5. **Update service**: inject Mongoose Model, viết CRUD methods + private `mapToResponse()`
6. **Update controller**: thêm `@ApiTags`, `@ApiOperation`, dùng `ParseObjectIdPipe`
7. **Update module file**: `MongooseModule.forFeature` + export service + export `MongooseModule`

---

## Standard backend folder structure

```
backend/src/
├── main.ts                              ✅ Foundation đã wire global
├── app.module.ts                        ✅ Foundation đã setup ConfigModule + MongooseModule
│
├── config/                              ✅ Foundation
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── common/                              ✅ Foundation — utilities kỹ thuật
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   ├── interceptors/
│   │   └── response.interceptor.ts
│   └── pipes/
│       └── parse-objectid.pipe.ts
│
├── shared/                              ✅ Foundation — constants & types
│   ├── constants/
│   │   ├── error-codes.ts
│   │   └── business-rules.ts
│   └── types/
│       └── api-response.types.ts
│
└── modules/                             ← AI tạo module ở đây
    ├── health/                          ✅ Đã có
    ├── auth/
    ├── customer/
    ├── booking/
    │   ├── booking/                     # 1 collection 1 folder con khi module có nhiều collection
    │   └── otp-verification/
    ├── spa-service/
    │   ├── spa-service/
    │   ├── service-material/
    │   └── commission-config/
    ├── employee/
    │   ├── employee/
    │   └── staff-service/
    ├── invoice/
    │   ├── invoice/
    │   └── payment-log/
    ├── inventory/
    │   ├── material/
    │   ├── supplier/
    │   └── stock-receipt/
    ├── report/
    ├── payroll/
    └── operational-cost/
        ├── operational-cost/
        └── operational-cost-log/
```

### Quy tắc folder cho module

**Module có 1 collection duy nhất** (vd: `customer`, `payroll`, `report`):
```
customer/
├── customer.module.ts
├── customer.controller.ts
├── customer.service.ts
├── customer.schema.ts                    # FLAT, không subfolder schemas/
└── dto/
    ├── create-customer.dto.ts
    ├── update-customer.dto.ts
    ├── query-customer.dto.ts
    └── customer-response.dto.ts
```

**Module có nhiều collection** (vd: `inventory`, `booking`, `spa-service`):
```
inventory/
├── inventory.module.ts                   # Module gộp khai báo tất cả schemas/controllers/services
│
├── material/                             # 1 collection 1 folder con
│   ├── material.controller.ts
│   ├── material.service.ts
│   ├── material.schema.ts
│   └── dto/
│       ├── create-material.dto.ts
│       ├── update-material.dto.ts
│       ├── query-material.dto.ts
│       └── material-response.dto.ts
│
├── supplier/
│   ├── supplier.controller.ts
│   ├── supplier.service.ts
│   ├── supplier.schema.ts
│   └── dto/
│
└── stock-receipt/
    ├── stock-receipt.controller.ts
    ├── stock-receipt.service.ts
    ├── stock-receipt.schema.ts
    └── dto/
```

### Module file gộp pattern

```typescript
// inventory.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Material, MaterialSchema } from './material/material.schema';
import { MaterialController } from './material/material.controller';
import { MaterialService } from './material/material.service';

import { Supplier, SupplierSchema } from './supplier/supplier.schema';
import { SupplierController } from './supplier/supplier.controller';
import { SupplierService } from './supplier/supplier.service';

import { StockReceipt, StockReceiptSchema } from './stock-receipt/stock-receipt.schema';
import { StockReceiptController } from './stock-receipt/stock-receipt.controller';
import { StockReceiptService } from './stock-receipt/stock-receipt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: StockReceipt.name, schema: StockReceiptSchema },
    ]),
  ],
  controllers: [MaterialController, SupplierController, StockReceiptController],
  providers: [MaterialService, SupplierService, StockReceiptService],
  exports: [
    MaterialService,
    SupplierService,
    StockReceiptService,
    MongooseModule,                       // ⚠️ Quan trọng: cho module khác inject Model
  ],
})
export class InventoryModule {}
```

**`exports: [MongooseModule]`** cho phép module khác (vd: `BookingModule`, `InvoiceModule`) chỉ cần `imports: [InventoryModule]` rồi `@InjectModel(Material.name)` mà không cần re-declare schema.

---

## Mongoose Schema Pattern

```typescript
// material.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

export enum MaterialUnit {
  ML    = 'ml',
  GRAM  = 'gram',
  CAI   = 'cai',
  BO    = 'bo',
  GOI   = 'goi',
  LAN   = 'lan',
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'materials',
})
export class Material {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  // TS field = camelCase (theo CODING_CONVENTION 3.1)
  // MongoDB field = snake_case (qua name option)
  @Prop({ required: true, name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Prop({ required: true, name: 'unit_price' })
  unitPrice: number;

  @Prop({ required: true, enum: MaterialUnit })
  unit: MaterialUnit;

  @Prop({ required: true, name: 'low_stock_threshold', default: 10 })
  lowStockThreshold: number;

  @Prop({ required: true, name: 'is_active', default: true })
  isActive: boolean;

  // Timestamps auto-managed
  created_at?: Date;
  updated_at?: Date;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

MaterialSchema.index({ code: 1 }, { unique: true });
```

**Critical rules:**
1. Class name **PascalCase**, file name **kebab-case**: `Material` trong `material.schema.ts`
2. **Timestamps option** `{ createdAt: 'created_at', updatedAt: 'updated_at' }` — Mongoose mặc định lưu `createdAt`, `updatedAt` (camelCase) → vi phạm convention. Phải override.
3. **TS field name LUÔN camelCase**, dùng `@Prop({ name: 'snake_case' })` map sang MongoDB
4. **Indexes** declared sau `SchemaFactory.createForClass()` bằng `<Entity>Schema.index({...})`
5. **Reference fields** dùng `MongooseSchema.Types.ObjectId + ref: 'EntityName'`
6. **Embed structures** dùng sub-schema với `_id: false`
7. **Soft delete** field `isActive: boolean`, default `true`
8.**Dynamic Relative Paths:** Pay close attention to the depth of the directory when importing from `common/` or `shared/`. Adjust the number of `../` accordingly (e.g., a flat module like `customer/` requires fewer `../` than a nested module like `inventory/material/`).
9.**Dependency Injection (DI) Encapsulation:** ALWAYS add the newly created `Service` to the `exports: [...]` array of the Module file. Cross-module communications must happen via Services, NEVER by injecting another module's Mongoose Model directly.

### Embed sub-schema pattern

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
export class ServiceSnapshot {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SpaService', name: 'service_id', required: true })
  serviceId: Types.ObjectId;

  @Prop({ required: true, name: 'service_name' })
  serviceName: string;

  @Prop({ required: true, name: 'unit_price' })
  unitPrice: number;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  subtotal: number;
}

const ServiceSnapshotSchema = SchemaFactory.createForClass(ServiceSnapshot);

// Trong Invoice schema
@Prop({ type: [ServiceSnapshotSchema], default: [], name: 'services_snapshot' })
servicesSnapshot: ServiceSnapshot[];
```

---

## DTO Pattern

Mọi entity CRUD phải có **4 DTO**. Tất cả field phải có `@ApiProperty` (required) hoặc `@ApiPropertyOptional`.

### CreateXxxDto

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min, IsInt } from 'class-validator';
import { MaterialUnit } from '../material.schema';

export class CreateMaterialDto {
  @ApiProperty({ example: 'MAT-001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Tinh dầu Olive' })
  @IsString()
  name: string;

  @ApiProperty({ example: 5000, description: 'VND/đơn vị' })
  @IsInt({ message: 'Đơn giá phải là số nguyên' })
  @Min(0, { message: 'Đơn giá không được âm' })
  unitPrice: number;

  @ApiProperty({ enum: MaterialUnit, example: MaterialUnit.ML })
  @IsEnum(MaterialUnit, { message: 'Đơn vị không hợp lệ' })
  unit: MaterialUnit;

  @ApiProperty({ example: 10, description: 'Cảnh báo khi tồn kho dưới ngưỡng' })
  @IsNumber()
  @Min(0)
  lowStockThreshold: number;

  @ApiPropertyOptional({ example: 0, description: 'Tồn kho ban đầu, mặc định 0' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;
}
```

### UpdateXxxDto

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateMaterialDto } from './create-material.dto';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}
```

### QueryXxxDto

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../../../shared/constants/business-rules';

export class QueryMaterialDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT, minimum: 1, maximum: MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: 'Tìm theo code hoặc name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter theo trạng thái active' })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
```

### XxxResponseDto

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialUnit } from '../material.schema';

export class MaterialResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  stockQuantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty({ enum: MaterialUnit })
  unit: MaterialUnit;

  @ApiProperty()
  lowStockThreshold: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;
}
```

---

## Service Pattern

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Material, MaterialDocument } from './material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { MaterialResponseDto } from './dto/material-response.dto';
import { ERROR_CODES } from '../../../shared/constants/error-codes';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  /**
   * Tạo vật liệu mới.
   *
   * @param dto - Dữ liệu vật liệu
   * @returns Vật liệu đã tạo
   * @throws ConflictException - Code đã tồn tại
   */
  async create(dto: CreateMaterialDto): Promise<MaterialResponseDto> {
    const existing = await this.materialModel.findOne({ code: dto.code });
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.MATERIAL_CODE_EXISTS,
        message: `Mã vật liệu '${dto.code}' đã tồn tại`,
      });
    }

    const created = await this.materialModel.create(dto);
    return this.mapToResponse(created);
  }

  async findAll(query: QueryMaterialDto) {
    const { page, limit, search, isActive } = query;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      filter.is_active = isActive === 'true';
    }

    const [items, total] = await Promise.all([
      this.materialModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ created_at: -1 }),
      this.materialModel.countDocuments(filter),
    ]);

    return {
      data: items.map((item) => this.mapToResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<MaterialResponseDto> {
    const found = await this.materialModel.findById(id);
    if (!found) {
      throw new NotFoundException({
        code: ERROR_CODES.MATERIAL_NOT_FOUND,
        message: `Vật liệu '${id}' không tồn tại`,
      });
    }
    return this.mapToResponse(found);
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<MaterialResponseDto> {
    const updated = await this.materialModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.MATERIAL_NOT_FOUND,
        message: `Vật liệu '${id}' không tồn tại`,
      });
    }
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    const updated = await this.materialModel.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.MATERIAL_NOT_FOUND,
        message: `Vật liệu '${id}' không tồn tại`,
      });
    }
  }

  private mapToResponse(doc: MaterialDocument): MaterialResponseDto {
    return {
      id: doc._id.toString(),
      code: doc.code,
      name: doc.name,
      stockQuantity: doc.stockQuantity,
      unitPrice: doc.unitPrice,
      unit: doc.unit,
      lowStockThreshold: doc.lowStockThreshold,
      isActive: doc.isActive,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }
}
```

---

## Controller Pattern

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-objectid.pipe';

@ApiTags('Materials')
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo vật liệu mới' })
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách vật liệu (phân trang + filter)' })
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết vật liệu' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật vật liệu' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa vật liệu (soft delete)' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.materialService.remove(id);
  }
}
```

> ⚠️ **Lưu ý:** Controller method **trả về data raw**, ResponseInterceptor (foundation) tự wrap thành `{ success: true, data, ...meta? }`. KHÔNG tự wrap manually trong controller.

---

## Embed vs Reference — quy tắc quyết định

**Use Reference (`ObjectId + ref`) when:**
- Related entity có lifecycle độc lập
- Cần query riêng (vd: list services, list staff)
- Được reference bởi nhiều entity khác (customer trong booking + invoice)

**Use Embed (sub-schema array) when:**
- Data là snapshot tại thời điểm cụ thể (giá lúc thanh toán, tên service lúc phục vụ)
- Luôn đọc cùng parent, không bao giờ query riêng
- Bounded size (<100 items mỗi parent)

**Snapshot rule:** nếu giá trị tại "lúc đó" có ý nghĩa lịch sử (giá, tên tại thời điểm thanh toán) → embed. Đừng dùng ref + populate.

---

## Self-documenting code

### Naming rules (strict)

**Boolean: bắt đầu bằng `is`, `has`, `can`, `should`:**
```typescript
// ❌ AI thường generate kiểu này
const active: boolean;
const stockAvailable: boolean;

// ✅ Đúng
const isActive: boolean;
const hasAvailableStock: boolean;
const canCheckIn: boolean;
```

**Constants: `SCREAMING_SNAKE_CASE`:**
```typescript
const MAX_BOOKING_PER_DAY = 5;
const BOOKING_BUFFER_MINUTES = 15;
```

**Functions: verb-first, descriptive:**
```typescript
// ❌
async fn(id: string) { ... }
async getData() { ... }

// ✅
async findCustomerByPhone(phone: string) { ... }
async calculateCommissionForPeriod(staffId: string, period: string) { ... }
```

### Comments — chỉ giải thích "TẠI SAO"

```typescript
// ❌ Comment thừa — code đã tự giải thích
// Tìm customer theo ID
const customer = await this.customerModel.findById(id);

// ✅ Có giá trị — giải thích business logic không hiển nhiên
// VNPay yêu cầu amount nhân 100 vì lưu dạng VND × 100
const vnpAmount = invoice.totalAmount * VNPAY_AMOUNT_MULTIPLIER;

// ✅ Cảnh báo side effect
// Method này LOCK record trong DB — gọi sau khi đã validate xong
await this.lockBookingSlot(slotId);
```

### JSDoc cho public service methods (BẮT BUỘC)

```typescript
/**
 * Tạo booking mới với customer auto-create theo SĐT.
 *
 * @param dto - Dữ liệu booking từ khách hàng
 * @returns Booking đã tạo kèm thông tin staff được phân công
 * @throws ConflictException - Slot vừa bị đặt (race condition)
 * @throws BadRequestException - Không có nhân viên khả dụng
 */
async createBooking(dto: CreateBookingDto): Promise<BookingResponseDto> { ... }
```

Private methods KHÔNG cần JSDoc.

---

## Error codes — file shared duy nhất

Theo `CODING_CONVENTION.md` mục 6.2: tất cả error codes tập trung ở `shared/constants/error-codes.ts` (đã có sẵn ở Foundation).

```typescript
import { ERROR_CODES } from '../../../shared/constants/error-codes';

throw new NotFoundException({
  code: ERROR_CODES.CUSTOMER_NOT_FOUND,
  message: `Customer ${id} không tồn tại`,
});
```

**Nếu cần thêm error code mới:** sửa `shared/constants/error-codes.ts`, KHÔNG tạo file constants riêng cho module, tuân theo nguyên tắc:
1. Use a logical SCREAMING_SNAKE_CASE key in your generated code.
2. Explicitly instruct the User (in plain text) to append this new key to their `shared/constants/error-codes.ts` file. 
3. DO NOT create a new local constants file for the module.

---

## Validation conventions

- Error messages tiếng Việt
- Validation decorators ở DTO, KHÔNG validate trong service
- Common validators:
  ```typescript
  // Phone
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải đủ 10 chữ số' })

  // Email
  @IsEmail({}, { message: 'Email không hợp lệ' })

  // Money (VND)
  @IsInt() @Min(0)

  // Date
  @IsDateString()

  // ObjectId
  @IsMongoId({ message: 'ID không hợp lệ' })

  // Enum
  @IsEnum(MaterialUnit, { message: 'Đơn vị không hợp lệ' })
  ```

---

## Workflow tổng kết khi làm 1 Issue

```
1. Đọc Issue cung cáp bởi user → ghi note
2. Đọc MODULE_SPECS.md section liên quan (tham khảo)
3. Tạo branch: feature/<issue-id>-<short-desc>
4. Chạy `npx nest g resource modules/<path> --no-spec`
   → Có boilerplate
5. AI customize:
   a. Rename entities/ → schema flat trong module folder
   b. Replace schema theo Mongoose pattern (snake_case mapping)
   c. Edit 4 DTO với @ApiProperty + class-validator
   d. Edit service: inject Model, mapToResponse, error codes từ shared
   e. Edit controller: @ApiTags, @ApiOperation, ParseObjectIdPipe
   f. Update module: MongooseModule.forFeature, exports
6. Commit theo thứ tự: chore → docs → feat → refactor → docs
7. Test với Postman + verify Swagger UI
8. Push branch, tạo PR link Issue
9. Vu review → squash merge
```

---

## What NOT to do

- ❌ Don't use `any` type
- ❌ Don't return raw Mongoose documents from service — luôn qua `mapToResponse()`
- ❌ Don't manually wrap response trong controller (`{ success: true, ... }`) — ResponseInterceptor làm rồi
- ❌ Don't put `try/catch` everywhere — exception filter handle
- ❌ Don't use `console.log` in committed code — dùng `Logger`
- ❌ Don't manually validate in service — use class-validator decorators on DTO
- ❌ Don't hardcode error code strings — use `ERROR_CODES` from `shared/constants/error-codes.ts`
- ❌ Don't forget `@ApiProperty` on DTO fields — FE openapi will break
- ❌ Don't use Mongoose `populate()` for snapshot data — embed instead
- ❌ Don't put schema in `schemas/` subfolder — flat trong module folder
- ❌ Don't use plural module names — singular: `customer/`, `booking/` (folder cấp module)
- ❌ Don't forget `exports: [MongooseModule]` trong module file — module khác cần inject Model
- ❌ Don't write boolean fields without `is/has/can/should` prefix
- ❌ Don't write comments that explain WHAT — only WHY
- ❌ Don't skip JSDoc for public service methods
- ❌ Don't override Foundation files (`common/`, `shared/`) — chỉ thêm constants nếu cần
- ❌ Don't hallucinate import paths — double-check the relative `../` traversal to `common/` and `shared/` based on folder depth.
- ❌ Don't ask for a GitHub link to read the issue — always rely on the issue content directly provided by the user in the prompt.

---

## Reference files

- `MODULE_SPECS.md` — Tham khảo collections, fields, business rules
- `CODING_CONVENTION.md` (project root) — Naming + code style toàn dự án
- `CONTRIBUTING.md` (project root) — Git workflow + commit format
- `backend/README.md` — Tổng quan backend + cấu trúc folder

> Khi MODULE_SPECS và Issue mâu thuẫn → **theo Issue**, ghi rõ trong PR description.

---

## Skill liên quan

- **`spa-backend-pr-review`** — Dùng khi review PR Khánh/Vu vừa code xong, audit module có sẵn, hoặc kiểm tra một module có tuân thủ convention không. Skill này KHÔNG dùng cho việc đó.
