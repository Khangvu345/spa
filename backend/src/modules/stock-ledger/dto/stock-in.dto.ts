import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class StockInDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId({ message: 'materialId không hợp lệ' })
  materialId: string;

  @ApiProperty({ example: 100, description: 'Số lượng nhập (>0)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'quantity phải là số' })
  @Min(0.0001, { message: 'quantity phải > 0' })
  quantity: number;

  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId({ message: 'supplierId không hợp lệ' })
  supplierId: string;

  @ApiProperty({ example: 800, description: 'Giá nhập (VND, integer)' })
  @Type(() => Number)
  @IsInt({ message: 'unitPrice phải là số nguyên' })
  @Min(0, { message: 'unitPrice không được âm' })
  unitPrice: number;

  @ApiPropertyOptional({ example: 'Nhập kho từ NCC', default: 'Nhập kho từ NCC' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
