import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Update BOM — chỉ cho sửa standardQuantity / note / isActive.
 * KHÔNG cho sửa serviceId / materialId (xóa entry rồi tạo mới nếu cần đổi material).
 */
export class UpdateBomDto {
  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'standardQuantity phải là số (tối đa 4 chữ số thập phân)' },
  )
  @Min(0.0001, { message: 'standardQuantity phải > 0' })
  standardQuantity?: number;

  @ApiPropertyOptional({ example: 'Tăng định mức theo quy trình mới' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
