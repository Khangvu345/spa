import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { BookingResponseDto } from '../../booking/dto/booking-response.dto';
import { IOtpProvider } from './otp-provider.interface';

@Injectable()
export class EmailOtpProvider implements IOtpProvider {
  constructor(private readonly configService: ConfigService) {}

  async send(email: string, code: string): Promise<void> {
    try {
      const { gmailUser, transporter } = this.createTransporter();

      await transporter.sendMail({
        from: gmailUser,
        to: email,
        subject: 'Mã OTP xác nhận đặt lịch tại Lunar Spa',
        text: [
          `Mã OTP xác nhận đặt lịch của bạn là: ${code}`,
          'Mã có hiệu lực trong 10 phút.',
          'Nếu bạn không thực hiện đặt lịch, vui lòng bỏ qua email này.',
        ].join('\n'),
      });
    } catch (error) {
      throw this.sendFailedException(this.getErrorMessage(error));
    }
  }

  async sendBookingConfirmed(
    email: string,
    booking: BookingResponseDto,
  ): Promise<void> {
    try {
      const { gmailUser, transporter } = this.createTransporter();

      await transporter.sendMail({
        from: gmailUser,
        to: email,
        subject: 'Xác nhận đặt lịch thành công tại Lunar Spa',
        text: this.buildBookingConfirmationText(booking),
      });
    } catch (error) {
      throw this.sendFailedException(this.getErrorMessage(error));
    }
  }

  private createTransporter() {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailAppPassword =
      this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword) {
      throw this.sendFailedException('Gmail chưa được cấu hình đầy đủ');
    }

    return {
      gmailUser,
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      }),
    };
  }

  private buildBookingConfirmationText(booking: BookingResponseDto): string {
    const scheduledStart = new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date(booking.scheduledStart));
    const price = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(booking.serviceSnapshot.price);

    return [
      `Xin chào ${booking.customerSnapshot.fullName},`,
      '',
      'Lunar Spa đã xác nhận lịch đặt của bạn thành công.',
      '',
      `Mã đặt lịch: ${booking.bookingCode}`,
      `Dịch vụ: ${booking.serviceSnapshot.name}`,
      `Thời gian: ${scheduledStart}`,
      `Chuyên viên: ${booking.staffSnapshot.fullName || 'Sẽ được sắp xếp'}`,
      `Giá dịch vụ: ${price}`,
      '',
      'Vui lòng đến trước giờ hẹn 10 phút để được tiếp đón tốt nhất.',
      'Nếu cần thay đổi lịch, vui lòng liên hệ Lunar Spa để được hỗ trợ.',
    ].join('\n');
  }

  private sendFailedException(message: string): InternalServerErrorException {
    return new InternalServerErrorException({
      code: ERROR_CODES.OTP_SEND_FAILED,
      message,
    });
  }

  private getErrorMessage(error: unknown): string {
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }

    return 'Gửi OTP qua Gmail thất bại';
  }
}
