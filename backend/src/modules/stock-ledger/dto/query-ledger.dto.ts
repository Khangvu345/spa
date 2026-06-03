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
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../../shared/constants/business-rules';
import {
  StockReferenceType,
  StockTransactionType,
} from '../stock-ledger.schema';

export type SortOrder = 'asc' | 'desc';

export class QueryLedgerDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId({ message: 'materialId không hợp lệ' })
  materialId?: string;

  @ApiPropertyOptional({ enum: StockTransactionType })
  @IsOptional()
  @IsEnum(StockTransactionType)
  transactionType?: StockTransactionType;

  @ApiPropertyOptional({ enum: StockReferenceType })
  @IsOptional()
  @IsEnum(StockReferenceType)
  referenceType?: StockReferenceType;

  @ApiPropertyOptional({ description: 'ISO date (YYYY-MM-DD hoặc full ISO)' })
  @IsOptional()
  @IsDateString({}, { message: 'fromDate phải là ISO date' })
  fromDate?: string;

  @ApiPropertyOptional({ description: 'ISO date (YYYY-MM-DD hoặc full ISO)' })
  @IsOptional()
  @IsDateString({}, { message: 'toDate phải là ISO date' })
  toDate?: string;

  @ApiPropertyOptional({ enum: ['createdAt'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['createdAt'])
  sortBy?: 'createdAt' = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}
