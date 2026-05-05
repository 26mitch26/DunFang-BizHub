import { request } from '@umijs/max';

export async function queryCompanyList(
  params: API.PageParams & {
    keyword?: string;
    name?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.CompanyRecord>>>('/api/companies', {
    method: 'GET',
    params: {
      current: params.current,
      size: params.pageSize ?? params.size,
      keyword: params.keyword ?? params.name,
    },
    ...(options || {}),
  });
}

export async function addCompany(
  data: Partial<API.CompanyRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<API.CompanyRecord>>('/api/companies', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateCompany(
  id: number,
  data: Partial<API.CompanyRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<API.CompanyRecord>>(`/api/companies/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteCompany(id: number, options?: { [key: string]: any }) {
  return request<API.Result<void>>(`/api/companies/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
