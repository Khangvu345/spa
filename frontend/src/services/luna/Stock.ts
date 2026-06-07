// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Nhập kho 1 material (ADMIN) POST /api/v1/stock/in */
export async function StockControllerStockIn(
  body: API.StockInDto,
  options?: { [key: string]: any },
) {
  return request<API.LedgerResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/stock/in`,
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

/** Lịch sử ledger (filter + pagination) — mọi role JWT GET /api/v1/stock/ledger */
export async function StockControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StockControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/stock/ledger`, {
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

/** Lịch sử ledger của 1 material — mọi role JWT GET /api/v1/stock/ledger/by-material/${param0} */
export async function StockControllerFindByMaterial(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StockControllerFindByMaterialParams,
  options?: { [key: string]: any },
) {
  const { materialId: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/stock/ledger/by-material/${param0}`,
    {
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
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}

/** Tìm ledger theo reference (Invoice ID / Stock In / Manual / Adjustment) GET /api/v1/stock/ledger/by-reference/${param0}/${param1} */
export async function StockControllerFindByReference(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StockControllerFindByReferenceParams,
  options?: { [key: string]: any },
) {
  const { type: param0, id: param1, ...queryParams } = params;
  return request<API.LedgerResponseDto[]>(
    `${APP_CONFIG_API_URL.replace(
      /\/api\/v1$/,
      '',
    )}/api/v1/stock/ledger/by-reference/${param0}/${param1}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Materials có stockQuantity <= reorderLevel (ADMIN) GET /api/v1/stock/low-stock */
export async function StockControllerGetLowStock(options?: { [key: string]: any }) {
  return request<API.LowStockResponseDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/stock/low-stock`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** Xuất kho thủ công — vỡ, mất, kiểm kê (ADMIN). reason bắt buộc POST /api/v1/stock/out/manual */
export async function StockControllerStockOutManual(
  body: API.StockOutManualDto,
  options?: { [key: string]: any },
) {
  return request<API.LedgerResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/stock/out/manual`,
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

/** Tổng nhập/xuất theo khoảng thời gian (ADMIN) GET /api/v1/stock/summary */
export async function StockControllerGetSummary(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StockControllerGetSummaryParams,
  options?: { [key: string]: any },
) {
  return request<API.StockSummaryResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/stock/summary`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
