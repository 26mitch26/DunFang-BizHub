import { request } from '@umijs/max';

export async function queryProductList(
  params: API.PageParams & {
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.ProductRecord>>>('/api/wms/products', {
    method: 'GET',
    params: {
      current: params.current,
      size: params.pageSize ?? params.size,
      name: params.name,
    },
    ...(options || {}),
  });
}

export async function addProduct(
  data: Partial<API.ProductRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<boolean>>('/api/wms/products', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateProduct(
  id: number,
  data: Partial<API.ProductRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<boolean>>(`/api/wms/products/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteProduct(id: number, options?: { [key: string]: any }) {
  return request<API.Result<boolean>>(`/api/wms/products/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
