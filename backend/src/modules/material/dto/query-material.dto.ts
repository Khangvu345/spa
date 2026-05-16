import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../../shared/constants/business-rules';
import { MaterialType } from '../material.schema';

export type MaterialSortField = 'name' | 'stockQuantity' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export class QueryMaterialDto {
  @ApiPropertyOptional({ description: 'Tìm theo name (regex, case-insensitive)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái active' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({ enum: MaterialType })
  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @ApiPropertyOptional({ description: 'Lọc theo supplierId (MongoId)' })
  @IsOptional()
  @IsMongoId({ message: 'supplierId không hợp lệ' })
  supplierId?: string;

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
    enum: ['name', 'stockQuantity', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'stockQuantity', 'createdAt'])
  sortBy?: MaterialSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}
