import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class QueryBomDto {
  @ApiPropertyOptional({ description: 'Filter theo serviceId' })
  @IsOptional()
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Filter theo materialId' })
  @IsOptional()
  @IsMongoId({ message: 'materialId không hợp lệ' })
  materialId?: string;

  @ApiPropertyOptional({ description: 'Filter theo trạng thái active' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as unknown;
  })
  @IsBoolean()
  isActive?: boolean;
}
