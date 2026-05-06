/**
 * Chuẩn Response envelope cho toàn hệ thống.
 * Mọi endpoint trả response wrap trong format này (qua ResponseInterceptor).
 *
 * ⚠️ File này CHỈ ở backend. FE generate types riêng từ swagger.json.
 */

import { ApiProperty } from '@nestjs/swagger';

// ──────────────────────────────────────
// Pagination Meta
// ──────────────────────────────────────

export class PaginationMeta {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

// ──────────────────────────────────────
// Success Response — 1 item
// ──────────────────────────────────────

export class ApiResponse<T> {
  @ApiProperty({ example: true })
  success: true;

  data: T;

  @ApiProperty({ required: false })
  message?: string;
}

// ──────────────────────────────────────
// Success Response — list with pagination
// ──────────────────────────────────────

export class ApiListResponse<T> {
  @ApiProperty({ example: true })
  success: true;

  data: T[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}

// ──────────────────────────────────────
// Error Response
// ──────────────────────────────────────

export class ApiErrorDetail {
  @ApiProperty({ example: 'CUSTOMER_NOT_FOUND' })
  code: string;

  @ApiProperty({ example: 'Customer abc123 không tồn tại' })
  message: string;

  @ApiProperty({ required: false, description: 'Validation errors hoặc info bổ sung' })
  details?: unknown;
}

export class ApiErrorResponse {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ type: ApiErrorDetail })
  error: ApiErrorDetail;
}