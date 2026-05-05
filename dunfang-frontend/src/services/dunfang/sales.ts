import { request } from '@umijs/max';

export async function queryOrderList(
  params: {
    current?: number;
    size?: number;
    companyId?: string;
    customerId?: string;
    status?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result>('/api/orders', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getOrderItems(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/orders/${id}/items`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createOrder(data: any, options?: { [key: string]: any }) {
  return request<API.Result>('/api/orders', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function confirmOrder(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/orders/${id}/confirm`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function deleteOrder(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/orders/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
