import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Model, Types } from 'mongoose';
import {
  BCRYPT_SALT_ROUNDS,
  OTP_EXPIRY_SECONDS,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../booking/booking.schema';
import { BookingService } from '../booking/booking.service';
import { BookingResponseDto } from '../booking/dto/booking-response.dto';
import { RequestBookingOtpDto } from './dto/request-booking-otp.dto';
import {
  ResendOtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/otp-response.dto';
import { OTP_PROVIDER } from './otp.constants';
import { OtpCode, OtpCodeDocument } from './otp-code.schema';
import type { IOtpProvider } from './providers/otp-provider.interface';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(OtpCode.name)
    private readonly otpCodeModel: Model<OtpCodeDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly bookingService: BookingService,
    @Inject(OTP_PROVIDER)
    private readonly otpProvider: IOtpProvider,
  ) {}

  async requestOtp(dto: RequestBookingOtpDto): Promise<BookingResponseDto> {
    const booking = await this.bookingService.createPublicPendingOtp(dto);
    await this.generateAndSend(booking.id);

    return this.bookingService.findOne(booking.id);
  }

  async generateAndSend(bookingId: string): Promise<void> {
    const booking = await this.findBookingOrThrow(bookingId);
    this.assertPendingBooking(booking);

    const email = booking.customerSnapshot.email?.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException({
        code: ERROR_CODES.OTP_SEND_FAILED,
        message: 'Booking không có email nhận OTP',
      });
    }

    const plainCode = this.generateCode();
    const codeHash = await bcrypt.hash(plainCode, BCRYPT_SALT_ROUNDS);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);

    await this.otpCodeModel
      .updateMany(
        {
          bookingId: booking._id,
          isUsed: false,
        },
        { $set: { isUsed: true } },
      )
      .exec();

    await this.otpCodeModel.create({
      bookingId: booking._id,
      email,
      codeHash,
      expiresAt,
      attemptCount: 0,
      isUsed: false,
      lastSentAt: now,
    });

    booking.otpCode = null;
    booking.otpExpiresAt = expiresAt;
    booking.otpAttempts = 0;
    await booking.save();

    await this.otpProvider.send(email, plainCode);
  }

  async verify(
    bookingId: string,
    inputCode: string,
  ): Promise<VerifyOtpResponseDto> {
    const booking = await this.findBookingOrThrow(bookingId);
    this.assertPendingBooking(booking);

    const otp = await this.findActiveOtpOrThrow(bookingId);
    if (otp.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException({
        code: ERROR_CODES.OTP_EXPIRED,
        message: 'Mã OTP đã hết hạn, vui lòng gửi lại mã mới',
      });
    }

    if (otp.attemptCount >= OTP_MAX_ATTEMPTS) {
      await this.cancelBookingByOtp(booking);
      throw new BadRequestException({
        code: ERROR_CODES.OTP_MAX_ATTEMPTS_EXCEEDED,
        message: 'Bạn đã nhập sai OTP quá số lần cho phép',
      });
    }

    const isValid = await bcrypt.compare(inputCode, otp.codeHash);
    if (!isValid) {
      return this.handleInvalidOtp(booking, otp);
    }

    otp.isUsed = true;
    booking.status = BookingStatus.CONFIRMED;
    booking.verifiedAt = new Date();
    booking.otpExpiresAt = null;
    booking.otpCode = null;
    booking.otpAttempts = otp.attemptCount;

    await Promise.all([otp.save(), booking.save()]);
    const confirmedBooking = await this.bookingService.findOne(bookingId);
    await this.sendBookingConfirmation(confirmedBooking);

    return { confirmed: true };
  }

  async resend(bookingId: string): Promise<ResendOtpResponseDto> {
    const booking = await this.findBookingOrThrow(bookingId);
    this.assertPendingBooking(booking);

    const activeOtp = await this.findActiveOtpOrThrow(bookingId);
    const now = Date.now();
    const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
    const canResendAt = activeOtp.lastSentAt.getTime() + cooldownMs;

    if (now < canResendAt) {
      throw new BadRequestException({
        code: ERROR_CODES.OTP_RESEND_TOO_SOON,
        message: 'Vui lòng chờ trước khi gửi lại OTP',
        details: {
          retryAfterSeconds: Math.ceil((canResendAt - now) / 1000),
        },
      });
    }

    activeOtp.isUsed = true;
    await activeOtp.save();
    await this.generateAndSend(bookingId);

    return { resent: true };
  }

  private async handleInvalidOtp(
    booking: BookingDocument,
    otp: OtpCodeDocument,
  ): Promise<VerifyOtpResponseDto> {
    const attemptCount = otp.attemptCount + 1;
    otp.attemptCount = attemptCount;
    booking.otpAttempts = attemptCount;

    if (attemptCount >= OTP_MAX_ATTEMPTS) {
      otp.isUsed = true;
      await Promise.all([otp.save(), this.cancelBookingByOtp(booking)]);
      throw new BadRequestException({
        code: ERROR_CODES.OTP_MAX_ATTEMPTS_EXCEEDED,
        message: 'Bạn đã nhập sai OTP quá số lần cho phép',
      });
    }

    await Promise.all([otp.save(), booking.save()]);
    throw new BadRequestException({
      code: ERROR_CODES.OTP_INVALID,
      message: 'Mã OTP không đúng',
    });
  }

  private async findBookingOrThrow(
    bookingId: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException({
        code: ERROR_CODES.BOOKING_NOT_FOUND,
        message: 'Booking không tồn tại',
      });
    }

    return booking;
  }

  private async findActiveOtpOrThrow(
    bookingId: string,
  ): Promise<OtpCodeDocument> {
    const otp = await this.otpCodeModel
      .findOne({
        bookingId: new Types.ObjectId(bookingId),
        isUsed: false,
      })
      .sort({ lastSentAt: -1 })
      .exec();

    if (!otp) {
      throw new NotFoundException({
        code: ERROR_CODES.OTP_NOT_FOUND,
        message: 'Không tìm thấy OTP đang hiệu lực',
      });
    }

    return otp;
  }

  private assertPendingBooking(booking: BookingDocument): void {
    if (booking.status !== BookingStatus.PENDING_OTP) {
      throw new BadRequestException({
        code: ERROR_CODES.BOOKING_INVALID_STATUS,
        message: 'Booking không ở trạng thái chờ xác thực OTP',
      });
    }
  }

  private async cancelBookingByOtp(booking: BookingDocument): Promise<void> {
    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancelReason = 'Nhập sai OTP quá số lần cho phép';
    await booking.save();
  }

  private async sendBookingConfirmation(
    booking: BookingResponseDto,
  ): Promise<void> {
    const email = booking.customerSnapshot.email?.trim().toLowerCase();
    if (!email) {
      this.logger.warn(
        `Skip booking confirmation email because booking ${booking.id} has no email`,
      );
      return;
    }

    try {
      await this.otpProvider.sendBookingConfirmed(email, booking);
    } catch (error) {
      this.logger.warn(
        `Booking ${booking.id} confirmed but confirmation email failed: ${this.getErrorMessage(error)}`,
      );
    }
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

    return 'Unknown error';
  }

  private generateCode(): string {
    const max = 10 ** OTP_LENGTH;
    return String(randomInt(0, max)).padStart(OTP_LENGTH, '0');
  }
}
