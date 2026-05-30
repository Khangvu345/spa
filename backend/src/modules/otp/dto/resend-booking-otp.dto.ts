import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ResendBookingOtpDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcee' })
  @IsMongoId({ message: 'bookingId không hợp lệ' })
  bookingId: string;
}
