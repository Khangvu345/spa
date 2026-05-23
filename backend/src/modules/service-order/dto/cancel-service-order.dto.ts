import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelServiceOrderDto {
  @ApiProperty({ example: 'Khách hủy giữa chừng', maxLength: 500 })
  @IsString({ message: 'Lý do hủy phải là chuỗi' })
  @IsNotEmpty({ message: 'Lý do hủy không được để trống' })
  @MaxLength(500, { message: 'Lý do hủy tối đa 500 ký tự' })
  reason: string;
}
