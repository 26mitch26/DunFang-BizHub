import { request } from '@umijs/max';

export async function getDashboardSummary() {
  return request<API.Result<Record<string, any>>>('/api/dashboard/summary', {
    method: 'GET',
  });
}

export async function getSalesTrend() {
  return request<API.Result<Array<Record<string, any>>>>('/api/dashboard/sales-trend', {
    method: 'GET',
  });
}

export async function getLowStockItems() {
  return request<API.Result<Array<Record<string, any>>>>('/api/dashboard/low-stock', {
    method: 'GET',
  });
}

export async function getPendingFollowUps() {
  return request<API.Result<API.FollowUpRecord[]>>('/api/dashboard/pending-follow-ups', {
    method: 'GET',
  });
}
