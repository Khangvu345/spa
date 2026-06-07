// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Theo dõi tình trạng server GET /api/v1/health */
export async function HealthControllerGetHealth(options?: { [key: string]: any }) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/health`, {
    method: 'GET',
    ...(options || {}),
  });
}
