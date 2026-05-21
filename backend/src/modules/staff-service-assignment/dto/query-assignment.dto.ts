import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class QueryAssignmentDto {
  @ApiPropertyOptional({ example: '665f2b8f2b9f2f00123abcde' })
  @IsOptional()
  @IsMongoId({ message: 'staffId không hợp lệ' })
  staffId?: string;

  @ApiPropertyOptional({ example: '665f2b8f2b9f2f00123abcd0' })
  @IsOptional()
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;
}
