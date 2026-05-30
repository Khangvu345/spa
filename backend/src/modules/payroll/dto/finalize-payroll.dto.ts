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

export class FinalizePayrollDto {
  @ApiProperty({ example: '665f1b2c3d4e5f6a7b8c9d0e' })
  @IsMongoId({ message: 'staffId không hợp lệ' })
  staffId: string;

  @ApiProperty({ example: 2026, minimum: 2020, maximum: 2100 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  periodYear: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Phụ cấp/phạt thủ công, cho phép âm lẫn dương. Default 0.',
  })
  @IsOptional()
  @IsInt()
  adjustment?: number = 0;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  note?: string;
}
