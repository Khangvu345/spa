import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class StockOutManualDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId({ message: 'materialId không hợp lệ' })
  materialId: string;

  @ApiProperty({ example: 10, description: 'Số lượng xuất (>0, sẽ lưu âm trong ledger)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'quantity phải là số' })
  @Min(0.0001, { message: 'quantity phải > 0' })
  quantity: number;

  @ApiProperty({ example: 'Hỏng do rơi vỡ', description: 'Lý do xuất kho (bắt buộc)' })
  @IsString()
  @IsNotEmpty({ message: 'reason là bắt buộc' })
  @MaxLength(500)
  reason: string;
}
