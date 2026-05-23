import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsInt({ message: 'discountAmount phải là số nguyên' })
  @Min(0, { message: 'discountAmount không được âm' })
  @Max(1_000_000_000)
  discountAmount?: number;

  @ApiPropertyOptional({ example: 'Cập nhật ghi chú' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
