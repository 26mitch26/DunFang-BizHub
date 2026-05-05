import { request } from '@umijs/max';

export async function queryInventoryList(
  params: {
    current?: number;
    size?: number;
    warehouseId?: string;
    productId?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result>('/api/wms/inventory', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function inboundInventory(data: any, options?: { [key: string]: any }) {
  return request<API.Result>('/api/wms/inventory/inbound', {
    method: 'POST',
    params: data, // Note: the backend uses @RequestParam for inbound
    ...(options || {}),
  });
}
