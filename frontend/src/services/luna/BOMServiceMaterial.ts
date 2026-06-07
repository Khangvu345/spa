// @ts-ignore
/* eslint-disable */
import request from '@/utils/openapiRequest';

/** Danh sách BOM entries (filter serviceId / materialId / isActive) — mọi role JWT GET /api/v1/bom */
export async function ServiceMaterialBomControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceMaterialBomControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<API.BomResponseDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bom`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Tạo BOM entry — cấu hình định mức (ADMIN) POST /api/v1/bom */
export async function ServiceMaterialBomControllerCreate(
  body: API.CreateBomDto,
  options?: { [key: string]: any },
) {
  return request<API.BomResponseDto>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Chi tiết BOM entry — mọi role JWT GET /api/v1/bom/${param0} */
export async function ServiceMaterialBomControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceMaterialBomControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BomResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bom/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Xóa BOM entry (hard delete) (ADMIN) DELETE /api/v1/bom/${param0} */
export async function ServiceMaterialBomControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceMaterialBomControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bom/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Sửa BOM entry (standardQuantity / note / isActive). KHÔNG sửa được serviceId/materialId (ADMIN) PATCH /api/v1/bom/${param0} */
export async function ServiceMaterialBomControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceMaterialBomControllerUpdateParams,
  body: API.UpdateBomDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BomResponseDto>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bom/${param0}`,
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

/** Reverse lookup — material X đang dùng ở service nào GET /api/v1/bom/by-material/${param0} */
export async function ServiceMaterialBomControllerFindByMaterial(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceMaterialBomControllerFindByMaterialParams,
  options?: { [key: string]: any },
) {
  const { materialId: param0, ...queryParams } = params;
  return request<API.BomResponseDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bom/by-material/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** BOM của 1 service (chỉ active) — dùng cho Auto Stock Deduction. Trả [] nếu chưa cấu hình GET /api/v1/bom/by-service/${param0} */
export async function ServiceMaterialBomControllerFindByService(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ServiceMaterialBomControllerFindByServiceParams,
  options?: { [key: string]: any },
) {
  const { serviceId: param0, ...queryParams } = params;
  return request<API.BomResponseDto[]>(
    `${APP_CONFIG_API_URL.replace(/\/api\/v1$/, '')}/api/v1/bom/by-service/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
