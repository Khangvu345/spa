import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcee' })
  @IsMongoId({ message: 'serviceOrderId không hợp lệ' })
  serviceOrderId: string;

  @ApiPropertyOptional({ example: 0, description: 'Giảm giá tổng (VND)' })
  @IsOptional()
  @IsInt({ message: 'discountAmount phải là số nguyên' })
  @Min(0, { message: 'discountAmount không được âm' })
  @Max(1_000_000_000)
  discountAmount?: number;

  @ApiPropertyOptional({ example: 'Khách thanh toán cuối ngày' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
