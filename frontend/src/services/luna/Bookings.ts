// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sach booking voi filter/search/sort GET /api/v1/bookings */
export async function BookingControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings`, {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // limit has a default value: 10
      limit: '10',

      // sortBy has a default value: scheduledStart
      sortBy: 'scheduledStart',
      // sortOrder has a default value: asc
      sortOrder: 'asc',
      ...params,
    },
    ...(options || {}),
  });
}

/** Khach tao booking tu landing page POST /api/v1/bookings */
export async function BookingControllerCreatePublic(
  body: API.CreateBookingPublicDto,
  options?: { [key: string]: any },
) {
  return request<API.BookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings`,
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

/** Chi tiet booking GET /api/v1/bookings/${param0} */
export async function BookingControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Cap nhat ghi chu hoac status booking PATCH /api/v1/bookings/${param0} */
export async function BookingControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerUpdateParams,
  body: API.UpdateBookingDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/${param0}`,
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

/** Huy booking POST /api/v1/bookings/${param0}/cancel */
export async function BookingControllerCancel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerCancelParams,
  body: API.CancelBookingDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/${param0}/cancel`,
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

/** Check-in booking va tao Service Order DRAFT POST /api/v1/bookings/${param0}/check-in */
export async function BookingControllerCheckIn(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerCheckInParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.CheckInBookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/${param0}/check-in`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Danh dau khach khong den POST /api/v1/bookings/${param0}/no-show */
export async function BookingControllerMarkNoShow(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerMarkNoShowParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/${param0}/no-show`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Top 8 khung gio goi y cho landing page GET /api/v1/bookings/availability */
export async function BookingControllerGetAvailability(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerGetAvailabilityParams,
  options?: { [key: string]: any },
) {
  return request<API.AvailabilityResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/availability`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Full grid slot availability cho operator GET /api/v1/bookings/availability/grid */
export async function BookingControllerGetAvailabilityGrid(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.BookingControllerGetAvailabilityGridParams,
  options?: { [key: string]: any },
) {
  return request<API.AvailabilityGridResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/availability/grid`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Operator tao booking thay khach POST /api/v1/bookings/operator */
export async function BookingControllerCreateOperator(
  body: API.CreateBookingOperatorDto,
  options?: { [key: string]: any },
) {
  return request<API.BookingResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bookings/operator`,
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
