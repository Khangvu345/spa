import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, Max, Min } from 'class-validator';

export class PreviewPayrollDto {
  @ApiProperty({ example: '665f1b2c3d4e5f6a7b8c9d0e' })
  @IsMongoId({ message: 'staffId không hợp lệ' })
  staffId: string;

  @ApiProperty({ example: 2026, minimum: 2020, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  periodYear: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;
}
