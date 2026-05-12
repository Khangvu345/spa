import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@spa.local' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Admin@123456' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(1, { message: 'Mật khẩu không được để trống' })
  password: string;
}
