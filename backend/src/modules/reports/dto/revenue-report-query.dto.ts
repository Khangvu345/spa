import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { DateRangeQueryDto } from './date-range-query.dto';

/**
 * Query cho báo cáo doanh thu (RP-02/RP-03).
 * `serviceId` optional → nếu có thì chỉ lấy doanh thu của riêng 1 dịch vụ (RP-03).
 */
export class RevenueReportQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({ description: 'Lọc doanh thu riêng 1 dịch vụ (RP-03)' })
  @IsOptional()
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId?: string;
}
