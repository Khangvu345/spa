// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách phiếu dịch vụ (pagination + filter + sort) GET /api/v1/service-orders */
export async function ServiceOrderControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/service-orders`, {
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

/** Tạo phiếu dịch vụ rỗng (OPERATOR/ADMIN) POST /api/v1/service-orders */
export async function ServiceOrderControllerCreate(
  body: API.CreateServiceOrderDto,
  options?: { [key: string]: any },
) {
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/service-orders`,
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

/** Chi tiết phiếu dịch vụ GET /api/v1/service-orders/${param0} */
export async function ServiceOrderControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/service-orders/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Cập nhật note/extraCharge hoặc chuyển DRAFT -> IN_PROGRESS PATCH /api/v1/service-orders/${param0} */
export async function ServiceOrderControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerUpdateParams,
  body: API.UpdateServiceOrderDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/service-orders/${param0}`,
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

/** Hủy phiếu dịch vụ POST /api/v1/service-orders/${param0}/cancel */
export async function ServiceOrderControllerCancel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerCancelParams,
  body: API.CancelServiceOrderDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/service-orders/${param0}/cancel`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** Đánh dấu phiếu đã hoàn thành POST /api/v1/service-orders/${param0}/complete */
export async function ServiceOrderControllerComplete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerCompleteParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/service-orders/${param0}/complete`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Thêm dịch vụ vào phiếu POST /api/v1/service-orders/${param0}/items */
export async function ServiceOrderControllerAddItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerAddItemParams,
  body: API.AddItemDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/service-orders/${param0}/items`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** Xóa item khỏi phiếu DELETE /api/v1/service-orders/${param0}/items/${param1} */
export async function ServiceOrderControllerRemoveItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerRemoveItemParams,
  options?: { [key: string]: any },
) {
  const { id: param0, itemId: param1, ...queryParams } = params;
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(
      /\/api\/v1$/,
      '',
    )}/api/v1/service-orders/${param0}/items/${param1}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Cập nhật số lượng/ghi chú của item PATCH /api/v1/service-orders/${param0}/items/${param1} */
export async function ServiceOrderControllerUpdateItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceOrderControllerUpdateItemParams,
  body: API.UpdateItemDto,
  options?: { [key: string]: any },
) {
  const { id: param0, itemId: param1, ...queryParams } = params;
  return request<API.ServiceOrderResponseDto>(
    `${APP_CONFIG_API_URL.replace(
      /\/api\/v1$/,
      '',
    )}/api/v1/service-orders/${param0}/items/${param1}`,
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
