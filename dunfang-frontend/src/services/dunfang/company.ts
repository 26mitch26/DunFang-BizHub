import { request } from '@umijs/max';

export async function queryCompanyList(
  params: {
    current?: number;
    size?: number;
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result>('/api/companies', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function addCompany(data: any, options?: { [key: string]: any }) {
  return request<API.Result>('/api/companies', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateCompany(id: string, data: any, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/companies/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteCompany(id: string, options?: { [key: string]: any }) {
  return request<API.Result>(`/api/companies/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
