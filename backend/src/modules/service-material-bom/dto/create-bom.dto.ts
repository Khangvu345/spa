import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBomDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId: string;

  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e2' })
  @IsMongoId({ message: 'materialId không hợp lệ' })
  materialId: string;

  @ApiProperty({
    example: 30,
    description:
      'Số lượng tiêu hao chuẩn cho 1 lần dịch vụ. Cho phép decimal (vd: 0.01) cho DEPRECIATION',
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'standardQuantity phải là số (tối đa 4 chữ số thập phân)' },
  )
  @Min(0.0001, { message: 'standardQuantity phải > 0' })
  standardQuantity: number;

  @ApiPropertyOptional({ example: '30ml tinh dầu olive', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
