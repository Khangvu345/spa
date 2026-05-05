# Coding Convention — Spa Management System
 
> Áp dụng cho **tất cả** thành viên. Cả BE (NestJS) và FE (React) đều dùng TypeScript nên convention được thống nhất.  
> **Nguyên tắc: Code phải tự giải thích được — đọc là hiểu, không cần comment.**
 
---
 
## 1. Quy tắc đặt tên (
 
### 1.1 Nguyên tắc chung
 
| Loại | Convention | Ví dụ |
|---|---|---|
| Variable / Function | `camelCase` | `bookingDate`, `calculateTotal()` |
| Class / Interface / Type | `PascalCase` | `BookingService`, `CustomerDto` |
| Constant (biến) | `SCREAMING_SNAKE_CASE` | `MAX_BOOKING_PER_DAY` |
| File (BE — NestJS) | `kebab-case` | `booking.service.ts` |
| File (FE — React component) | `PascalCase` | `BookingForm.tsx` |
| File (FE — utils/hooks) | `camelCase` | `useBooking.ts`, `formatDate.ts` |
| Folder | `kebab-case` | `booking/`, `employee-management/` |
| Enum | `PascalCase` (key: `SCREAMING_SNAKE_CASE`) | `BookingStatus.CONFIRMED` |
| MongoDB Collection | `snake_case` | `bookings`, `service_staff` |
 
### 1.2 Nguyên tắc đặt tên có nghĩa
 
```typescript
// ❌ Sai — tên vô nghĩa
const d = new Date();
const fn = (x: number) => x * 0.1;
const list = await db.find();
 
// ✅ Đúng — tên tự giải thích
const bookingDate = new Date();
const calculateCommissionRate = (baseSalary: number) => baseSalary * 0.1;
const activeBookings = await bookingRepository.findActive();
```
 
### 1.3 Boolean naming — phải bắt đầu bằng động từ trạng thái
 
```typescript
// ❌ Sai
const active: boolean;
const staffAvailable: boolean;
 
// ✅ Đúng
const isActive: boolean;
const hasAvailableStaff: boolean;
const canCheckIn: boolean;
```
 
---
 
## 2. TypeScript — Quy tắc bắt buộc
 
### 2.1 Không dùng `any`
 
```typescript
// ❌ Cấm dùng any — mất toàn bộ lợi ích TypeScript
const processData = (input: any): any => { ... }
 
// ✅ Định nghĩa type/interface rõ ràng
const processBooking = (input: CreateBookingDto): BookingResponseDto => { ... }
 
// ✅ Nếu thực sự chưa biết type → dùng unknown và type-guard
const parseApiResponse = (raw: unknown): BookingDto => {
  if (!isBookingDto(raw)) throw new Error('Invalid response shape');
  return raw;
};
```
 
### 2.2 Interface vs Type
 
```typescript
// Dùng interface cho object shape (có thể extend)
interface Customer {
  id: string;
  fullName: string;
  phone: string;
}
 
interface VIPCustomer extends Customer {
  membershipLevel: 'GOLD' | 'PLATINUM';
}
 
// Dùng type cho union, intersection, alias đơn giản
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type ServiceWithMaterials = Service & { materials: Material[] };
```
 
### 2.3 Enum — chỉ dùng string enum
 
```typescript
// ❌ Không dùng numeric enum — debug khó
enum BookingStatus { PENDING, CONFIRMED, CANCELLED }
 
// ✅ String enum — dễ đọc trong DB và log
enum BookingStatus {
  PENDING    = 'PENDING',
  CONFIRMED  = 'CONFIRMED',
  CANCELLED  = 'CANCELLED',
  COMPLETED  = 'COMPLETED',
  NO_SHOW    = 'NO_SHOW',
}
```
 
---
 
## 3. Metadata Schema — Chuẩn chung BE & FE 
 
> Đây là phần quan trọng nhất vì **cả BE lẫn FE đều dùng TypeScript** — metadata type được định nghĩa 1 lần, dùng ở cả 2 nơi.
 
### 3.1 Nguyên tắc Mapping
 
```
MongoDB Document  →  BE (NestJS Schema/DTO)  →  API Response  →  FE (TypeScript Interface)
     _id          →        id                →      id         →        id
  snake_case      →     camelCase            →   camelCase     →     camelCase
```
 
**Quy tắc:**
- MongoDB lưu: `snake_case` (theo MongoDB convention)
- Code (BE + FE): `camelCase` (theo TypeScript convention)
- NestJS tự động transform với `@Transform` decorator
 
### 3.2 Shared Types — OpenAPI contract Flow

**Cách tiếp cận cho dự án này (Parent + subtree Child):**  
Backend (Parent) là **nguồn tin cậy duy nhất** cho contract type. FE (Child subtree) nhận types thông qua `umi openapi` generate từ `swagger.json` của BE — không copy tay, không tự định nghĩa lại.

### Luồng hoạt động
```
BE (NestJS)                        FE (Umi)
    │                                  │
    │  Decorator @ApiProperty          │
    │  trên DTO/Schema                 │
    │  ↓                               │
    │  @nestjs/swagger                 │
    │  ↓                               │
    │  swagger.json ──────────────────→│  npm run openapi (umi openapi)
    │  /api-docs (Swagger UI)          │  ↓
    │                                  │  src/services/spa-api/
    │                                  │  ├── typings.d.ts   ← types
    │                                  │  ├── booking.ts     ← API functions
    │                                  │  ├── customer.ts
    │                                  │  └── ...
```

### Quy tắc vận hành

- Chỉ sửa DTO ở `backend/src/**/dto/*.ts`
- FE **không** sửa file trong `src/services/spa-api/`
- Mỗi khi BE thay đổi API → chạy `npm run openapi` ở FE để sync
- PR BE phải ghi rõ thay đổi contract để FE biết cần re-generate

### Lý do không lo conflict TypeScript version

- FE nhận types qua file `.d.ts` được generate — không phụ thuộc syntax TS 5.x của BE
- `umi openapi` generate code tương thích với TS version của FE (4.2.2)
- Không share source TypeScript trực tiếp giữa hai project
### 3.3 Chuẩn Response Object
 
Mọi API response đều wrap trong envelope thống nhất:
 
```typescript
// shared/types/api-response.types.ts
 
// Response thành công — 1 item
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
 
// Response thành công — nhiều item
interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}
 
// Response lỗi
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;         // VD: "BOOKING_NOT_FOUND"
    message: string;      // VD: "Không tìm thấy lịch đặt"
    details?: unknown;    // Thông tin bổ sung (validation errors, etc.)
  };
}
 
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```
 
### 3.4 Chuẩn ID & Timestamps
 
```typescript
// Mọi entity đều extends BaseEntity
interface BaseEntity {
  id: string;           // Mapped từ MongoDB _id (ObjectId → string)
  createdAt: string;    // ISO 8601: "2024-01-15T08:30:00.000Z"
  updatedAt: string;    // ISO 8601
}
 
// Ví dụ thực tế
interface Booking extends BaseEntity {
  bookingCode: string;        // VD: "20240115-0042"
  status: BookingStatus;
  customerId: string;         // Reference — chỉ lưu ID, không embed object
  serviceIds: string[];
  staffId: string | null;     // null nếu chưa phân công
  scheduledAt: string;        // ISO 8601
  totalEstimatedCost: number; // Đơn vị: VND (không dùng float)
  notes?: string;
}
```
 
### 3.5 Mapping MongoDB → NestJS Schema
 
```typescript
// booking.schema.ts (BE)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { BookingStatus } from '../constants/booking.constants';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'bookings'
})
export class Booking {
  // TS field name = camelCase (theo mục 3.1)
  // MongoDB lưu snake_case qua @Prop({ name: '...' })

  @Prop({ required: true, unique: true, name: 'booking_code' })
  bookingCode: string;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    name: 'customer_id'
  })
  customerId: Types.ObjectId;

  @Prop({ required: true, name: 'scheduled_at' })
  scheduledAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ booking_code: 1 }, { unique: true });
```
 
```typescript
// booking-response.dto.ts (BE) — Đây là type FE nhận được
export class BookingResponseDto {
  id: string;
  bookingCode: string;      // camelCase trong DTO
  status: BookingStatus;
  customerId: string;       // camelCase
  scheduledAt: string;      // camelCase, ISO string
  totalEstimatedCost: number;
  createdAt: string;
  updatedAt: string;
}
```
 
---
 
## 4. Cấu trúc Function & Class
 
### 4.1 Function — ngắn, 1 nhiệm vụ
 
```typescript
// ❌ Function làm quá nhiều thứ
async function handleBooking(dto: CreateBookingDto) {
  // validate
  // check availability
  // create booking
  // send notification
  // update stats
}
 
// ✅ Tách nhỏ, mỗi function 1 nhiệm vụ
async createBooking(dto: CreateBookingDto): Promise<BookingResponseDto> {
  await this.validateBookingConstraints(dto);
  const staff = await this.resolveStaffAssignment(dto);
  const booking = await this.bookingRepository.create({ ...dto, staffId: staff.id });
  await this.notificationService.notifyStaff(staff, booking);
  return this.mapToResponseDto(booking);
}
```
 
### 4.2 Async/Await — không dùng .then() callback hell
 
```typescript
// ❌ Sai
getBookingWithCustomer(id: string) {
  return this.bookingRepository.findById(id)
    .then(booking => {
      return this.customerRepository.findById(booking.customerId)
        .then(customer => ({ ...booking, customer }));
    });
}
 
// ✅ Đúng
async getBookingWithCustomer(id: string) {
  const booking = await this.bookingRepository.findById(id);
  const customer = await this.customerRepository.findById(booking.customerId);
  return { ...booking, customer };
}
```
 
---
 
## 5. Comment & Documentation
 
### 5.1 Comment chỉ giải thích "tại sao", không phải "cái gì"
 
```typescript
// ❌ Comment thừa — code đã tự giải thích
// Tăng biến i lên 1
i++;
 
// ❌ Comment thừa — tên function đã nói lên tất cả
// Tính tổng tiền
calculateTotalAmount();
 
// ✅ Comment có giá trị — giải thích business logic không hiển nhiên
// Buffer 15 phút giữa các booking — tránh nhân viên phải chuyển phòng gấp
const BOOKING_BUFFER_MINUTES = 15;
 
// ✅ Comment cảnh báo side effect quan trọng
// Hàm này sẽ LOCK slot trong DB — gọi sau khi đã validate xong để tránh deadlock
await this.slotLockingService.acquireLock(slotId);
```
 
### 5.2 JSDoc cho public API của service
 
```typescript
/**
 * Tạo booking mới và phân công nhân viên.
 * 
 * @param dto - Dữ liệu booking từ khách hàng
 * @returns Booking đã tạo kèm thông tin nhân viên được phân công
 * @throws ConflictException - Nếu slot vừa bị đặt (race condition)
 * @throws BadRequestException - Nếu không có nhân viên khả dụng
 */
async createBooking(dto: CreateBookingDto): Promise<BookingResponseDto> { ... }
```
 
---
 
## 6. Error Handling
 
### 6.1 Sử dụng NestJS built-in exceptions (BE)
 
```typescript
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
 
// ✅ Dùng đúng loại exception
if (!booking) throw new NotFoundException(`Booking ${id} không tồn tại`);
if (slotTaken) throw new ConflictException('Slot này vừa được đặt, vui lòng chọn giờ khác');
if (!dto.serviceIds.length) throw new BadRequestException('Phải chọn ít nhất 1 dịch vụ');
```
 
### 6.2 Error codes — dùng constant, không hardcode string
 
```typescript
// shared/constants/error-codes.ts
export const ERROR_CODES = {
  BOOKING_NOT_FOUND:      'BOOKING_NOT_FOUND',
  SLOT_UNAVAILABLE:       'SLOT_UNAVAILABLE',
  STAFF_NOT_QUALIFIED:    'STAFF_NOT_QUALIFIED',
  MAX_BOOKING_EXCEEDED:   'MAX_BOOKING_EXCEEDED',
} as const;
```
 
---
 
## 7. Git Convention
 
> Quy tắc branch naming, commit message, và Pull Request được mô tả tại:  
> **[`CONTRIBUTING.md` — Mục "Quy trình Git"](./CONTRIBUTING.md#quy-trình-git)**
 
## 8. Checklist trước khi tạo PR
 
- Không có `console.log` debug còn sót lại
- Không có `any` type
- Tất cả function async đều có try-catch hoặc để NestJS filter xử lý
- Tên biến, function rõ ràng — không cần đọc implementation mới hiểu
- Response shape đúng chuẩn `ApiResponse<T>`
- Không commit file `.env`