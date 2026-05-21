import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../../shared/constants/business-rules';
import { CustomerSource } from '../customer.schema';

export type CustomerSortField = 'fullName' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export class QueryCustomerDto {
  @ApiPropertyOptional({
    description: 'Tìm theo fullName hoặc phone (regex, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CustomerSource })
  @IsOptional()
  @IsEnum(CustomerSource, { message: 'Nguồn khách hàng không hợp lệ' })
  source?: CustomerSource;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái active' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

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

  @ApiPropertyOptional({
    enum: ['fullName', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['fullName', 'createdAt'])
  sortBy?: CustomerSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}
