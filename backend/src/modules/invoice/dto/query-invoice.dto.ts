import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../../shared/constants/business-rules';
import { InvoiceStatus, PaymentMethod } from '../invoice.schema';

export type InvoiceSortField = 'createdAt' | 'paidAt' | 'totalAmount';

export class QueryInvoiceDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId({ message: 'customerId không hợp lệ' })
  customerId?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus, { message: 'status không hợp lệ' })
  status?: InvoiceStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'paymentMethod không hợp lệ' })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'INV-20260523-0001' })
  @IsOptional()
  @IsString()
  invoiceCode?: string;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'paidAt', 'totalAmount'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'paidAt', 'totalAmount'] as InvoiceSortField[])
  sortBy?: InvoiceSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
