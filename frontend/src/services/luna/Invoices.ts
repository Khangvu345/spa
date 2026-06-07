// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách hóa đơn (filter + pagination + sort) GET /api/v1/invoices */
export async function InvoiceControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.InvoiceControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices`, {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // limit has a default value: 20
      limit: '20',

      // sortBy has a default value: createdAt
      sortBy: 'createdAt',
      // sortOrder has a default value: desc
      sortOrder: 'desc',
      ...params,
    },
    ...(options || {}),
  });
}

/** Tạo hóa đơn từ Service Order COMPLETED POST /api/v1/invoices */
export async function InvoiceControllerCreate(
  body: API.CreateInvoiceDto,
  options?: { [key: string]: any },
) {
  return request<API.InvoiceResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices`,
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

/** Chi tiết hóa đơn GET /api/v1/invoices/${param0} */
export async function InvoiceControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.InvoiceControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InvoiceResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Cập nhật discount / note (chỉ khi DRAFT) PATCH /api/v1/invoices/${param0} */
export async function InvoiceControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.InvoiceControllerUpdateParams,
  body: API.UpdateInvoiceDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InvoiceResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices/${param0}`,
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

/** Hủy hóa đơn (chỉ DRAFT / PENDING_PAYMENT) POST /api/v1/invoices/${param0}/cancel */
export async function InvoiceControllerCancel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.InvoiceControllerCancelParams,
  body: API.CancelInvoiceDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InvoiceResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices/${param0}/cancel`,
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

/** Xuất hóa đơn ra PDF để in bill GET /api/v1/invoices/${param0}/export-pdf */
export async function InvoiceControllerExportPdf(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.InvoiceControllerExportPdfParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices/${param0}/export-pdf`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Chốt invoice: DRAFT -> PENDING_PAYMENT POST /api/v1/invoices/${param0}/finalize */
export async function InvoiceControllerFinalize(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.InvoiceControllerFinalizeParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InvoiceResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices/${param0}/finalize`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Confirm CASH thanh toán: PENDING_PAYMENT -> PAID + Auto Stock Deduction POST /api/v1/invoices/${param0}/mark-paid */
export async function InvoiceControllerMarkPaid(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.InvoiceControllerMarkPaidParams,
  body: API.MarkPaidDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InvoiceResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/invoices/${param0}/mark-paid`,
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
