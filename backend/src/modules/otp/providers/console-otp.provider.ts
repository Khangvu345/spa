import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from './otp-provider.interface';

@Injectable()
export class ConsoleOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(ConsoleOtpProvider.name);

  async send(recipient: string, code: string): Promise<void> {
    this.logger.log(`[OTP MOCK] gửi tới ${recipient}: ${code}`);
  }
}
