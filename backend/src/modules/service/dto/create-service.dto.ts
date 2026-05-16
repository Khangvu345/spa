import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ServiceCategory } from '../service.schema';

export class CreateServiceDto {
  @ApiProperty({ example: 'SWEDISH_60', description: 'Mã dịch vụ duy nhất (A-Z, 0-9, _), 3-30 ký tự' })
  @IsString()
  @IsNotEmpty({ message: 'Mã dịch vụ không được để trống' })
  @Length(3, 30, { message: 'Mã dịch vụ phải có độ dài 3-30 ký tự' })
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Mã dịch vụ chỉ chấp nhận chữ in hoa, số và dấu gạch dưới',
  })
  code: string;

  @ApiProperty({ example: 'Massage Thụy Điển' })
  @IsString()
  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  @Length(2, 100, { message: 'Tên dịch vụ phải có độ dài 2-100 ký tự' })
  name: string;

  @ApiProperty({ enum: ServiceCategory, example: ServiceCategory.SWEDISH })
  @IsEnum(ServiceCategory, { message: 'Loại dịch vụ không hợp lệ' })
  category: ServiceCategory;

  @ApiProperty({ example: 350000, description: 'Giá bán (VND)' })
  @IsInt({ message: 'Giá bán phải là số nguyên' })
  @Min(0, { message: 'Giá bán không được âm' })
  unitPrice: number;

  @ApiProperty({ example: 60, description: 'Thời gian thực hiện (phút)' })
  @IsInt({ message: 'Thời gian thực hiện phải là số nguyên' })
  @Min(1, { message: 'Thời gian thực hiện tối thiểu 1 phút' })
  @Max(480, { message: 'Thời gian thực hiện tối đa 480 phút' })
  durationMinutes: number;

  @ApiPropertyOptional({ example: 15, default: 15, description: 'Thời gian dọn dẹp (phút)' })
  @IsOptional()
  @IsInt({ message: 'Buffer phải là số nguyên' })
  @Min(0, { message: 'Buffer không được âm' })
  @Max(120, { message: 'Buffer tối đa 120 phút' })
  bufferMinutes?: number;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Số slot chiếm dụng' })
  @IsOptional()
  @IsInt({ message: 'Số slot phải là số nguyên' })
  @Min(1)
  @Max(10)
  slotsRequired?: number;

  @ApiPropertyOptional({ example: 'Massage truyền thống với kỹ thuật vuốt dài.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Mô tả tối đa 1000 ký tự' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.spa.vn/services/swedish.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'imageUrl phải là URL hợp lệ' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
