import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword@123' })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi' })
  @MinLength(1, { message: 'Mật khẩu hiện tại không được để trống' })
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @MaxLength(128, { message: 'Mật khẩu mới không được quá 128 ký tự' })
  newPassword: string;
}
