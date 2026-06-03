import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import {
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../../shared/constants/business-rules';
import { ServiceOrderStatus } from '../service-order.schema';

export type ServiceOrderSortField = 'createdAt' | 'totalAmount';
export type SortOrder = 'asc' | 'desc';

export class QueryServiceOrderDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = 10;

  @ApiPropertyOptional({ example: '665f2b8f2b9f2f00123abcde' })
  @IsOptional()
  @IsMongoId({ message: 'customerId không hợp lệ' })
  customerId?: string;

  @ApiPropertyOptional({ enum: ServiceOrderStatus })
  @IsOptional()
  @IsEnum(ServiceOrderStatus, { message: 'Trạng thái phiếu không hợp lệ' })
  status?: ServiceOrderStatus;

  @ApiPropertyOptional({ example: '2026-05-21' })
  @IsOptional()
  @IsDateString({}, { message: 'fromDate phải là ngày ISO hợp lệ' })
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-05-21' })
  @IsOptional()
  @IsDateString({}, { message: 'toDate phải là ngày ISO hợp lệ' })
  toDate?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'totalAmount'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'totalAmount'])
  sortBy?: ServiceOrderSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}
