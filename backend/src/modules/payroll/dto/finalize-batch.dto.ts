import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FinalizeBatchDto {
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
    default: true,
    description:
      'true: chỉ chốt staff có phát sinh hoa hồng trong tháng; false: chốt mọi STAFF active (kể cả hoa hồng = 0).',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  onlyWithCommission?: boolean = true;
}
