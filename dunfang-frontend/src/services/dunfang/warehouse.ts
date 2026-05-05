import { request } from '@umijs/max';

export async function queryWarehouseList(
  params: {
    current?: number;
    size?: number;
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result>('/api/wms/warehouses', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// NOTE: Since I haven't implemented warehouse CRUD in the backend controller yet,
// I should use generic mock or wait. But I will just prepare the API functions.
export async function addWarehouse(data: any, options?: { [key: string]: any }) {
  return request<API.Result>('/api/wms/warehouses', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateWarehouse(id: string, data: any, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/wms/warehouses/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteWarehouse(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/wms/warehouses/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
