import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MaterialType } from '../material.schema';

export class CreateMaterialDto {
  @ApiProperty({ example: 'OIL_OLIVE' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 30, { message: 'Code phải có độ dài 3-30 ký tự' })
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Code chỉ gồm chữ HOA, số và dấu gạch dưới (_)',
  })
  code: string;

  @ApiProperty({ example: 'Tinh dầu Olive' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200, { message: 'Tên vật liệu phải có độ dài 2-200 ký tự' })
  name: string;

  @ApiPropertyOptional({ example: 'Dầu olive dùng cho massage đá nóng' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'ml', description: 'ml | gram | piece | set' })
  @IsString()
  @Length(1, 20)
  unit: string;

  @ApiProperty({ enum: MaterialType, example: MaterialType.CONSUMABLE })
  @IsEnum(MaterialType, {
    message: 'type phải là CONSUMABLE hoặc DEPRECIATION',
  })
  type: MaterialType;

  @ApiProperty({ example: 800, description: 'Giá nhập đơn vị (VND, integer)' })
  @Type(() => Number)
  @IsInt({ message: 'unitPrice phải là số nguyên' })
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 3000, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'stockQuantity phải là số' })
  @Min(0)
  stockQuantity?: number = 0;

  @ApiPropertyOptional({ example: 500, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'reorderLevel phải là số' })
  @Min(0)
  reorderLevel?: number = 0;

  @ApiPropertyOptional({
    example: 100,
    description: 'Số lần dùng được/unit — required khi type=DEPRECIATION',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'expectedUsesPerUnit phải là số' })
  @Min(0)
  @Max(100000)
  expectedUsesPerUnit?: number;

  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId({ message: 'supplierId không hợp lệ' })
  supplierId: string;
}
