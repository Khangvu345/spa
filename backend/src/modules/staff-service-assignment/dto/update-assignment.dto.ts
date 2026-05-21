import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt({ message: 'Tỉ lệ hoa hồng phải là số nguyên' })
  @Min(0, { message: 'Tỉ lệ hoa hồng không được âm' })
  @Max(100, { message: 'Tỉ lệ hoa hồng tối đa 100%' })
  commissionRate?: number;

  @ApiPropertyOptional({
    example: '2026-05-21T00:00:00.000Z',
    description: 'ISO 8601',
  })
  @IsOptional()
  @IsDateString({}, { message: 'assignedSince phải là ISO date string' })
  assignedSince?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'Chuyên viên chính phụ trách Massage Thụy Điển',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  note?: string;
}
