import { request } from '@umijs/max';

export async function queryProductList(
  params: {
    current?: number;
    size?: number;
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result>('/api/wms/products', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function addProduct(data: any, options?: { [key: string]: any }) {
  return request<API.Result>('/api/wms/products', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateProduct(id: string, data: any, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/wms/products/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteProduct(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/wms/products/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
