import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ example: 'Khach bao huy lich' })
  @IsString({ message: 'Ly do huy phai la chuoi' })
  @IsNotEmpty({ message: 'Ly do huy khong duoc de trong' })
  @MaxLength(500, { message: 'Ly do huy toi da 500 ky tu' })
  reason: string;
}
