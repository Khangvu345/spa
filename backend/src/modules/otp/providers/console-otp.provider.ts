import { Injectable, Logger } from '@nestjs/common';
import { BookingResponseDto } from '../../booking/dto/booking-response.dto';
import { IOtpProvider } from './otp-provider.interface';

@Injectable()
export class ConsoleOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(ConsoleOtpProvider.name);

  async send(recipient: string, code: string): Promise<void> {
    this.logger.log(`[OTP MOCK] gửi tới ${recipient}: ${code}`);
  }

  async sendBookingConfirmed(
    recipient: string,
    booking: BookingResponseDto,
  ): Promise<void> {
    this.logger.log(
      `[BOOKING CONFIRMED MOCK] gửi tới ${recipient}: ${booking.bookingCode}`,
    );
  }
}
