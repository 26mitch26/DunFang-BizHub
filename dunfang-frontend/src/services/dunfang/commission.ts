import { request } from '@umijs/max';

export async function queryCommissionRules(
  params: { current?: number; pageSize?: number; size?: number; brandId?: string },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.CommissionRuleRecord>>>('/api/commissions/rules', {
    method: 'GET',
    params: {
      current: params.current,
      size: params.pageSize ?? params.size,
      brandId: params.brandId,
    },
    ...(options || {}),
  });
}

export async function createCommissionRule(
  data: Partial<API.CommissionRuleRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<API.CommissionRuleRecord>>('/api/commissions/rules', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateCommissionRule(
  id: number,
  data: Partial<API.CommissionRuleRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<API.CommissionRuleRecord>>(`/api/commissions/rules/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteCommissionRule(id: number, options?: { [key: string]: any }) {
  return request<API.Result<void>>(`/api/commissions/rules/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function queryCommissionRecords(
  params: { current?: number; pageSize?: number; size?: number; orderId?: string },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.CommissionRecordItem>>>('/api/commissions/records', {
    method: 'GET',
    params: {
      current: params.current,
      size: params.pageSize ?? params.size,
      orderId: params.orderId,
    },
    ...(options || {}),
  });
}
