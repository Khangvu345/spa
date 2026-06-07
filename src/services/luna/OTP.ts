// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Tạo booking PENDING_OTP và gửi mã OTP qua email POST /api/v1/public/bookings/request-otp */
export async function OtpControllerRequestOtp(
  body: API.RequestBookingOtpDto,
  options?: { [key: string]: any },
) {
  return request<API.BookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/public/bookings/request-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** Gửi lại OTP sau thời gian cooldown POST /api/v1/public/bookings/resend-otp */
export async function OtpControllerResendOtp(
  body: API.ResendBookingOtpDto,
  options?: { [key: string]: any },
) {
  return request<API.ResendOtpResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/public/bookings/resend-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** Xác thực OTP và chuyển booking sang CONFIRMED POST /api/v1/public/bookings/verify-otp */
export async function OtpControllerVerifyOtp(
  body: API.VerifyBookingOtpDto,
  options?: { [key: string]: any },
) {
  return request<API.VerifyOtpResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/public/bookings/verify-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}
