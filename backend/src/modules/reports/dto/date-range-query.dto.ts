import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

/**
 * Query base dùng chung cho các báo cáo theo khoảng thời gian.
 *
 * `fromDate`/`toDate` là chuỗi ngày (YYYY-MM-DD hoặc ISO 8601). Service sẽ
 * convert sang khoảng `[fromDate 00:00, toDate+1 00:00)` theo giờ server để
 * lọc TRỌN ngày cuối (invoice paidAt 23:59 ngày cuối vẫn được tính).
 *
 * Validate `fromDate <= toDate` thực hiện ở service (throw 400 VALIDATION_FAILED)
 * vì cần so sánh 2 field — class-validator không tiện cross-field.
 */
export class DateRangeQueryDto {
  @ApiProperty({ example: '2026-05-01', description: 'Đầu kỳ (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'fromDate phải là ngày hợp lệ (YYYY-MM-DD)' })
  fromDate: string;

  @ApiProperty({ example: '2026-05-31', description: 'Cuối kỳ (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'toDate phải là ngày hợp lệ (YYYY-MM-DD)' })
  toDate: string;
}
