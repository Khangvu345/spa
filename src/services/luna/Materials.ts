// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách vật liệu (pagination + filter + search + sort) — mọi role JWT GET /api/v1/materials */
export async function MaterialControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.MaterialControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/materials`, {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // limit has a default value: 10
      limit: '10',
      // sortBy has a default value: createdAt
      sortBy: 'createdAt',
      // sortOrder has a default value: desc
      sortOrder: 'desc',
      ...params,
    },
    ...(options || {}),
  });
}

/** Tạo vật liệu mới (ADMIN) POST /api/v1/materials */
export async function MaterialControllerCreate(
  body: API.CreateMaterialDto,
  options?: { [key: string]: any },
) {
  return request<API.MaterialResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/materials`,
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

/** Chi tiết vật liệu (populate supplier) — mọi role JWT GET /api/v1/materials/${param0} */
export async function MaterialControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.MaterialControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.MaterialResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/materials/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Cập nhật vật liệu / toggle isActive (ADMIN) PATCH /api/v1/materials/${param0} */
export async function MaterialControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.MaterialControllerUpdateParams,
  body: API.UpdateMaterialDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.MaterialResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/materials/${param0}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}
