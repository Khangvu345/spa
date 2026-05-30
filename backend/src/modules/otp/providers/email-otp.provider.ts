import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { IOtpProvider } from './otp-provider.interface';

@Injectable()
export class EmailOtpProvider implements IOtpProvider {
  constructor(private readonly configService: ConfigService) {}

  async send(email: string, code: string): Promise<void> {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailAppPassword =
      this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword) {
      throw this.sendFailedException('Gmail chưa được cấu hình đầy đủ');
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

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
