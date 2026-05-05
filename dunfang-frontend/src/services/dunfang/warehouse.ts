import { request } from '@umijs/max';

export async function queryWarehouseList(
  params: API.PageParams & {
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.WarehouseRecord>>>('/api/wms/warehouses', {
    method: 'GET',
    params: {
      current: params.current,
      size: params.pageSize ?? params.size,
      name: params.name,
    },
    ...(options || {}),
  });
}

export async function addWarehouse(
  data: Partial<API.WarehouseRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<boolean>>('/api/wms/warehouses', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateWarehouse(
  id: number,
  data: Partial<API.WarehouseRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<boolean>>(`/api/wms/warehouses/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteWarehouse(id: number, options?: { [key: string]: any }) {
  return request<API.Result<boolean>>(`/api/wms/warehouses/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
