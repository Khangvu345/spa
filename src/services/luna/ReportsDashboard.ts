// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Số liệu tổng quan dashboard (1 call) — RP-01 GET /api/v1/dashboard/overview */
export async function ReportsControllerGetDashboardOverview(options?: { [key: string]: any }) {
  return request<API.DashboardOverviewDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/dashboard/overview`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** Thống kê theo dịch vụ (số lượt + doanh thu) — RP-04 GET /api/v1/reports/by-service */
export async function ReportsControllerGetByService(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ReportsControllerGetByServiceParams,
  options?: { [key: string]: any },
) {
  return request<API.ServiceRevenueRowDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/reports/by-service`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Thống kê theo nhân viên (số ca + doanh thu + hoa hồng) — RP-05 GET /api/v1/reports/by-staff */
export async function ReportsControllerGetByStaff(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ReportsControllerGetByStaffParams,
  options?: { [key: string]: any },
) {
  return request<API.StaffStatsDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/reports/by-staff`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Báo cáo doanh thu theo kỳ (+ filter serviceId) — RP-02/RP-03 GET /api/v1/reports/revenue */
export async function ReportsControllerGetRevenueReport(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ReportsControllerGetRevenueReportParams,
  options?: { [key: string]: any },
) {
  return request<API.RevenueReportDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/reports/revenue`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Export báo cáo doanh thu ra Excel (.xlsx) — RP-07 GET /api/v1/reports/revenue/export */
export async function ReportsControllerExportRevenueExcel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ReportsControllerExportRevenueExcelParams,
  options?: { [key: string]: any },
) {
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/reports/revenue/export`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Export báo cáo doanh thu ra PDF — RP-07B GET /api/v1/reports/revenue/export-pdf */
export async function ReportsControllerExportRevenuePdf(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ReportsControllerExportRevenuePdfParams,
  options?: { [key: string]: any },
) {
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/reports/revenue/export-pdf`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Chi tiết hóa đơn của 1 dịch vụ trong kỳ — RP-06 GET /api/v1/reports/service-invoices */
export async function ReportsControllerGetServiceInvoices(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ReportsControllerGetServiceInvoicesParams,
  options?: { [key: string]: any },
) {
  return request<API.ServiceInvoiceRowDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/reports/service-invoices`,
    {
      method: 'GET',
      params: {
        // page has a default value: 1
        page: '1',
        // limit has a default value: 20
        limit: '20',
        ...params,
      },
      ...(options || {}),
    },
  );
}
