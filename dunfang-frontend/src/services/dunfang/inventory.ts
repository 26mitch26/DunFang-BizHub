import { request } from '@umijs/max';

export async function queryInventoryList(
  params: API.PageParams & {
    warehouseId?: string;
    productId?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.InventoryBatchRecord>>>(
    '/api/wms/inventory',
    {
      method: 'GET',
      params: {
        current: params.current,
        size: params.pageSize ?? params.size,
        warehouseId: params.warehouseId,
        productId: params.productId,
      },
      ...(options || {}),
    },
  );
}

export async function inboundInventory(
  data: {
    warehouseId: number;
    locationId: number;
    productId: number;
    quantity: number;
    unitCost: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<boolean>>('/api/wms/inventory/inbound', {
    method: 'POST',
    params: data,
    ...(options || {}),
  });
}
