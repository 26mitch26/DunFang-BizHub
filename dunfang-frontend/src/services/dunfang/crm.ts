import { request } from '@umijs/max';

export async function queryFollowUpList(
  params: { current?: number; pageSize?: number; size?: number; customerId?: string },
  options?: { [key: string]: any },
) {
  return request<API.Result<API.PageData<API.FollowUpRecord>>>('/api/crm/follow-ups', {
    method: 'GET',
    params: {
      current: params.current,
      size: params.pageSize ?? params.size,
      customerId: params.customerId,
    },
    ...(options || {}),
  });
}

export async function getFollowUp(id: number) {
  return request<API.Result<API.FollowUpRecord>>(`/api/crm/follow-ups/${id}`, {
    method: 'GET',
  });
}

export async function createFollowUp(
  data: Partial<API.FollowUpRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<API.FollowUpRecord>>('/api/crm/follow-ups', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function updateFollowUp(
  id: number,
  data: Partial<API.FollowUpRecord>,
  options?: { [key: string]: any },
) {
  return request<API.Result<API.FollowUpRecord>>(`/api/crm/follow-ups/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

export async function deleteFollowUp(id: number, options?: { [key: string]: any }) {
  return request<API.Result<void>>(`/api/crm/follow-ups/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function queryPendingFollowUps() {
  return request<API.Result<API.FollowUpRecord[]>>('/api/crm/follow-ups/pending', {
    method: 'GET',
  });
}
