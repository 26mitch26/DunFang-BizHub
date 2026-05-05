import { request } from '@umijs/max';

/** Auth API - DunFang BizHub Backend */

export async function login(body: { email: string; password: string }) {
  return request<API.Result<API.TokenResponse>>('/api/auth/login', {
    method: 'POST',
    data: body,
  });
}

export async function register(body: {
  email: string;
  password: string;
  phone?: string;
  nickname?: string;
}) {
  return request<API.Result<API.TokenResponse>>('/api/auth/register', {
    method: 'POST',
    data: body,
  });
}

export async function refreshToken(refreshToken: string) {
  return request<API.Result<API.TokenResponse>>('/api/auth/refresh', {
    method: 'POST',
    params: { refreshToken },
  });
}

export async function currentUser() {
  // For now, decode from localStorage token
  const tokenData = localStorage.getItem('dunfang_user');
  if (tokenData) {
    return JSON.parse(tokenData) as API.CurrentUser;
  }
  return undefined;
}
