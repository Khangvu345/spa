// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách phiếu lương (filter tháng/staff/status) GET /api/v1/payrolls */
export async function PayrollControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PayrollControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls`, {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // limit has a default value: 20
      limit: '20',

      // sortBy has a default value: finalizedAt
      sortBy: 'finalizedAt',
      // sortOrder has a default value: desc
      sortOrder: 'desc',
      ...params,
    },
    ...(options || {}),
  });
}

/** Chi tiết 1 phiếu — ADMIN xem mọi phiếu, STAFF chỉ phiếu của mình GET /api/v1/payrolls/${param0} */
export async function PayrollControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PayrollControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.PayrollResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Hủy phiếu (chỉ khi chưa PAID) POST /api/v1/payrolls/${param0}/cancel */
export async function PayrollControllerCancel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PayrollControllerCancelParams,
  body: API.CancelPayrollDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.PayrollResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/${param0}/cancel`,
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

/** Xuất phiếu lương ra PDF — ADMIN xem mọi phiếu, STAFF chỉ phiếu của mình GET /api/v1/payrolls/${param0}/export-pdf */
export async function PayrollControllerExportPdf(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PayrollControllerExportPdfParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/${param0}/export-pdf`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Đánh dấu đã chi lương: FINALIZED → PAID POST /api/v1/payrolls/${param0}/mark-paid */
export async function PayrollControllerMarkPaid(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PayrollControllerMarkPaidParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.PayrollResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/${param0}/mark-paid`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Chốt lương 1 nhân viên cho 1 tháng POST /api/v1/payrolls/finalize */
export async function PayrollControllerFinalize(
  body: API.FinalizePayrollDto,
  options?: { [key: string]: any },
) {
  return request<API.PayrollResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/finalize`,
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

/** Chốt lương hàng loạt cho 1 tháng POST /api/v1/payrolls/finalize-batch */
export async function PayrollControllerFinalizeBatch(
  body: API.FinalizeBatchDto,
  options?: { [key: string]: any },
) {
  return request<API.PayrollBatchResultDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/finalize-batch`,
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

/** Phiếu lương của chính mình GET /api/v1/payrolls/me */
export async function PayrollControllerFindMine(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PayrollControllerFindMineParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/me`, {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // limit has a default value: 20
      limit: '20',

      // sortBy has a default value: finalizedAt
      sortBy: 'finalizedAt',
      // sortOrder has a default value: desc
      sortOrder: 'desc',
      ...params,
    },
    ...(options || {}),
  });
}

/** Xem trước (tính live, KHÔNG lưu) cho 1 staff + tháng GET /api/v1/payrolls/preview */
export async function PayrollControllerPreview(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.PayrollControllerPreviewParams,
  options?: { [key: string]: any },
) {
  return request<API.PayrollPreviewDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/payrolls/preview`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
