import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, Matches } from 'class-validator';
import { OTP_LENGTH } from '../../../shared/constants/business-rules';

export class VerifyBookingOtpDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcee' })
  @IsMongoId({ message: 'bookingId không hợp lệ' })
  bookingId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(new RegExp(`^[0-9]{${OTP_LENGTH}}$`), {
    message: `Mã OTP phải gồm ${OTP_LENGTH} chữ số`,
  })
  code: string;
}
