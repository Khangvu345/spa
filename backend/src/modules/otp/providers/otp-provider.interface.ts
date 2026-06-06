import { BookingResponseDto } from '../../booking/dto/booking-response.dto';

export interface IOtpProvider {
  send(recipient: string, code: string): Promise<void>;
  sendBookingConfirmed(
    recipient: string,
    booking: BookingResponseDto,
  ): Promise<void>;
}
