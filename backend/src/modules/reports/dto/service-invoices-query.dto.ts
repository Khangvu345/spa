import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../../shared/constants/business-rules';
import { DateRangeQueryDto } from './date-range-query.dto';

/**
 * Query cho chi tiết hóa đơn của 1 dịch vụ trong kỳ (RP-06).
 * `serviceId` BẮT BUỘC + pagination (list có thể dài).
 */
export class ServiceInvoicesQueryDto extends DateRangeQueryDto {
  @ApiProperty({ description: 'Dịch vụ cần xem chi tiết hóa đơn' })
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId: string;

  @ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: DEFAULT_LIMIT,
    minimum: 1,
    maximum: MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;
}
