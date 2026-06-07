// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách mapping chuyên viên - dịch vụ (có filter) GET /api/v1/staff-service-assignments */
export async function StaffServiceAssignmentControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StaffServiceAssignmentControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<API.AssignmentResponseDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/staff-service-assignments`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Tạo mapping chuyên viên - dịch vụ mới (ADMIN) POST /api/v1/staff-service-assignments */
export async function StaffServiceAssignmentControllerCreate(
  body: API.CreateAssignmentDto,
  options?: { [key: string]: any },
) {
  return request<API.AssignmentResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/staff-service-assignments`,
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

/** Cập nhật commissionRate / assignedSince / note / isActive (ADMIN) PATCH /api/v1/staff-service-assignments/${param0} */
export async function StaffServiceAssignmentControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StaffServiceAssignmentControllerUpdateParams,
  body: API.UpdateAssignmentDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.AssignmentResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/staff-service-assignments/${param0}`,
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

/** Tìm chuyên viên active phụ trách một dịch vụ GET /api/v1/staff-service-assignments/by-service/${param0} */
export async function StaffServiceAssignmentControllerFindByService(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StaffServiceAssignmentControllerFindByServiceParams,
  options?: { [key: string]: any },
) {
  const { serviceId: param0, ...queryParams } = params;
  return request<API.AssignmentResponseDto>(
    `${APP_CONFIG_API_URL.replace(
      /\/api\/v1$/,
      '',
    )}/api/v1/staff-service-assignments/by-service/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Tìm các dịch vụ active của một chuyên viên GET /api/v1/staff-service-assignments/by-staff/${param0} */
export async function StaffServiceAssignmentControllerFindByStaff(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.StaffServiceAssignmentControllerFindByStaffParams,
  options?: { [key: string]: any },
) {
  const { staffId: param0, ...queryParams } = params;
  return request<API.AssignmentResponseDto[]>(
    `${APP_CONFIG_API_URL.replace(
      /\/api\/v1$/,
      '',
    )}/api/v1/staff-service-assignments/by-staff/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
