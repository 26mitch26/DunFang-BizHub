import { request } from '@umijs/max';

export async function queryOrderList(
  params: API.PageParams & {
    companyId?: string;
    customerId?: string;
    status?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.SalesOrderRecord>>>('/api/orders', {
    method: 'GET',
    params: {
      current: params.current,
      size: params.pageSize ?? params.size,
      companyId: params.companyId,
      customerId: params.customerId,
      status: params.status,
    },
    ...(options || {}),
  });
}

export async function getOrderItems(id: number, options?: { [key: string]: any }) {
  return request<API.Result<API.SalesOrderItemRecord[]>>(`/api/orders/${id}/items`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createOrder(
  data: {
    order: Partial<API.SalesOrderRecord>;
    items: Array<Partial<API.SalesOrderItemRecord>>;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.SalesOrderRecord>>('/api/orders', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateOrder(
  id: number,
  data: {
    order: Partial<API.SalesOrderRecord>;
    items: Array<Partial<API.SalesOrderItemRecord>>;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.SalesOrderRecord>>(`/api/orders/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function confirmOrder(id: number, options?: { [key: string]: any }) {
  return request<API.Result<API.SalesOrderRecord>>(`/api/orders/${id}/confirm`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function deleteOrder(id: number, options?: { [key: string]: any }) {
  return request<API.Result<void>>(`/api/orders/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
