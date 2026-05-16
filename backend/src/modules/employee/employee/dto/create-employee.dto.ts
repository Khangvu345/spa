import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { StaffRole } from '../staff.schema';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString({ message: 'Họ tên phải là chuỗi' })
  fullName: string;

  @ApiProperty({ example: '0901234567' })
  @Matches(/^[0-9]{10}$/, {
    message: 'Số điện thoại phải đủ 10 chữ số',
  })
  phone: string;

  @ApiProperty({ example: 'nguyen@spa.local' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 128, example: 'Password@123' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
  @MaxLength(128, { message: 'Mật khẩu không được vượt quá 128 ký tự' })
  password: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.STAFF })
  @IsEnum(StaffRole, { message: 'Vai trò không hợp lệ' })
  role: StaffRole;

  @ApiProperty({ example: 8000000, description: 'Lương cứng tháng - VND' })
  @IsInt({ message: 'Lương cứng phải là số nguyên' })
  @Min(0, { message: 'Lương cứng không được âm' })
  baseSalary: number;

  @ApiProperty({ example: '2026-05-12T00:00:00.000Z' })
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  startedAt: string;
}
