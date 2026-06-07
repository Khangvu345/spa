// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Upload ảnh dịch vụ lên Cloudinary (ADMIN) POST /api/v1/upload/service-image */
export async function UploadControllerUploadServiceImage(
  body: {},
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.UploadImageResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/upload/service-image`,
    {
      method: 'POST',
      data: formData,
      requestType: 'form',
      ...(options || {}),
    },
  );
}
