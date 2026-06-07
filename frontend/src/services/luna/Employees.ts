// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách nhân viên có phân trang, filter, search, sort GET /api/v1/employees */
export async function EmployeeControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.EmployeeControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees`, {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // limit has a default value: 10
      limit: '10',

      // sortBy has a default value: startedAt
      sortBy: 'startedAt',
      // sortOrder has a default value: desc
      sortOrder: 'desc',
      ...params,
    },
    ...(options || {}),
  });
}

/** Tạo nhân viên mới kèm tài khoản đăng nhập POST /api/v1/employees */
export async function EmployeeControllerCreate(
  body: API.CreateEmployeeDto,
  options?: { [key: string]: any },
) {
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Chi tiết nhân viên GET /api/v1/employees/${param0} */
export async function EmployeeControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.EmployeeControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Xóa mềm tài khoản nhân viên sau 30 ngày khóa DELETE /api/v1/employees/${param0} */
export async function EmployeeControllerDeleteAccount(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.EmployeeControllerDeleteAccountParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees/${param0}`,
    {
      method: 'DELETE',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Cập nhật thông tin nhân viên, không đổi email/password PATCH /api/v1/employees/${param0} */
export async function EmployeeControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.EmployeeControllerUpdateParams,
  body: API.UpdateEmployeeDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees/${param0}`,
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

/** Khóa tài khoản nhân viên POST /api/v1/employees/${param0}/lock */
export async function EmployeeControllerLockAccount(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.EmployeeControllerLockAccountParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees/${param0}/lock`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Admin reset mật khẩu nhân viên về giá trị mặc định POST /api/v1/employees/${param0}/reset-password */
export async function EmployeeControllerResetPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.EmployeeControllerResetPasswordParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees/${param0}/reset-password`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Mở khóa tài khoản nhân viên POST /api/v1/employees/${param0}/unlock */
export async function EmployeeControllerUnlockAccount(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.EmployeeControllerUnlockAccountParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/employees/${param0}/unlock`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
