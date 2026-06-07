// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Đổi mật khẩu của chính staff đang đăng nhập POST /api/v1/auth/change-password */
export async function AuthControllerChangePassword(
  body: API.ChangePasswordDto,
  options?: { [key: string]: any },
) {
  return request<API.AuthResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/auth/change-password`,
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

/** Đăng nhập staff bằng email và mật khẩu POST /api/v1/auth/login */
export async function AuthControllerLogin(body: API.LoginDto, options?: { [key: string]: any }) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Lấy thông tin staff hiện tại GET /api/v1/auth/me */
export async function AuthControllerGetMe(options?: { [key: string]: any }) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/auth/me`, {
    method: 'GET',
    ...(options || {}),
  });
}
