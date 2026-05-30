import { ApiProperty } from '@nestjs/swagger';
import { BookingResponseDto } from '../../booking/dto/booking-response.dto';

export class VerifyOtpResponseDto {
  @ApiProperty({ example: true })
  confirmed: boolean;
}

export class ResendOtpResponseDto {
  @ApiProperty({ example: true })
  resent: boolean;
}

export class RequestOtpResponseDto extends BookingResponseDto {}
