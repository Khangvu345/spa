// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách khách hàng (pagination + search + filter + sort) — mọi role JWT GET /api/v1/customers */
export async function CustomerControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.CustomerControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/customers`, {
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

/** Tạo khách hàng mới (OPERATOR/ADMIN) POST /api/v1/customers */
export async function CustomerControllerCreate(
  body: API.CreateCustomerDto,
  options?: { [key: string]: any },
) {
  return request<API.CustomerResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/customers`,
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

/** Chi tiết khách hàng — mọi role JWT GET /api/v1/customers/${param0} */
export async function CustomerControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.CustomerControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.CustomerResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/customers/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Cập nhật thông tin khách hàng (OPERATOR/ADMIN) PATCH /api/v1/customers/${param0} */
export async function CustomerControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.CustomerControllerUpdateParams,
  body: API.UpdateCustomerDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.CustomerResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/customers/${param0}`,
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

/** Bật/tắt trạng thái active của khách hàng (ADMIN) PATCH /api/v1/customers/${param0}/toggle-active */
export async function CustomerControllerToggleActive(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.CustomerControllerToggleActiveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.CustomerResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/customers/${param0}/toggle-active`,
    {
      method: 'PATCH',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Tra cứu nhanh khách hàng theo số điện thoại GET /api/v1/customers/by-phone/${param0} */
export async function CustomerControllerFindByPhone(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.CustomerControllerFindByPhoneParams,
  options?: { [key: string]: any },
) {
  const { phone: param0, ...queryParams } = params;
  return request<API.CustomerResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/customers/by-phone/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Upsert customer theo phone cho booking flow POST /api/v1/customers/find-or-create */
export async function CustomerControllerFindOrCreate(
  body: API.FindOrCreateCustomerDto,
  options?: { [key: string]: any },
) {
  return request<API.FindOrCreateResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/customers/find-or-create`,
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
