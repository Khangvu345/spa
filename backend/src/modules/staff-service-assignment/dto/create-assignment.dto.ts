import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    example: '665f2b8f2b9f2f00123abcde',
    description: 'ObjectId của chuyên viên STAFF',
  })
  @IsMongoId({ message: 'staffId không hợp lệ' })
  staffId: string;

  @ApiProperty({
    example: '665f2b8f2b9f2f00123abcd0',
    description: 'ObjectId của dịch vụ',
  })
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId: string;

  @ApiProperty({
    example: 20,
    minimum: 0,
    maximum: 100,
    description: 'Phần trăm hoa hồng. Ví dụ 20 = 20%',
  })
  @IsInt({ message: 'Tỉ lệ hoa hồng phải là số nguyên' })
  @Min(0, { message: 'Tỉ lệ hoa hồng không được âm' })
  @Max(100, { message: 'Tỉ lệ hoa hồng tối đa 100%' })
  commissionRate: number;

  @ApiPropertyOptional({
    example: '2026-05-21T00:00:00.000Z',
    description: 'ISO 8601, mặc định là thời điểm tạo mapping',
  })
  @IsOptional()
  @IsDateString({}, { message: 'assignedSince phải là ISO date string' })
  assignedSince?: string;

  @ApiPropertyOptional({
    example: 'Chuyên viên chính phụ trách Massage Thụy Điển',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  note?: string;
}
