import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../booking/booking.schema';
import { BookingModule } from '../booking/booking.module';
import {
  OTP_PROVIDER,
  OTP_PROVIDER_CONSOLE,
  OTP_PROVIDER_EMAIL,
} from './otp.constants';
import { OtpController } from './otp.controller';
import { OtpCode, OtpCodeSchema } from './otp-code.schema';
import { OtpService } from './otp.service';
import { ConsoleOtpProvider } from './providers/console-otp.provider';
import { EmailOtpProvider } from './providers/email-otp.provider';

@Module({
  imports: [
    ConfigModule,
    BookingModule,
    MongooseModule.forFeature([
      { name: OtpCode.name, schema: OtpCodeSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [
    OtpService,
    EmailOtpProvider,
    ConsoleOtpProvider,
    {
      provide: OTP_PROVIDER,
      useFactory: (
        configService: ConfigService,
        emailProvider: EmailOtpProvider,
        consoleProvider: ConsoleOtpProvider,
      ) => {
        const provider =
          configService.get<string>('OTP_PROVIDER') ?? OTP_PROVIDER_CONSOLE;

        return provider === OTP_PROVIDER_EMAIL
          ? emailProvider
          : consoleProvider;
      },
      inject: [ConfigService, EmailOtpProvider, ConsoleOtpProvider],
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
