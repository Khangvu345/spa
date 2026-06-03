import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BookingResponseDto } from '../booking/dto/booking-response.dto';
import { RequestBookingOtpDto } from './dto/request-booking-otp.dto';
import { ResendBookingOtpDto } from './dto/resend-booking-otp.dto';
import {
  ResendOtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/otp-response.dto';
import { VerifyBookingOtpDto } from './dto/verify-booking-otp.dto';
import { OtpService } from './otp.service';

@ApiTags('OTP')
@Public()
@Controller('public/bookings')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('request-otp')
  @ApiOperation({
    summary: 'Tạo booking PENDING_OTP và gửi mã OTP qua email',
  })
  @ApiCreatedResponse({ type: BookingResponseDto })
  requestOtp(@Body() dto: RequestBookingOtpDto) {
    return this.otpService.requestOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác thực OTP và chuyển booking sang CONFIRMED' })
  @ApiOkResponse({ type: VerifyOtpResponseDto })
  verifyOtp(@Body() dto: VerifyBookingOtpDto) {
    return this.otpService.verify(dto.bookingId, dto.code);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi lại OTP sau thời gian cooldown' })
  @ApiOkResponse({ type: ResendOtpResponseDto })
  resendOtp(@Body() dto: ResendBookingOtpDto) {
    return this.otpService.resend(dto.bookingId);
  }
}
