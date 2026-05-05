import { request } from '@umijs/max';

const ACCESS_TOKEN_KEY = 'dunfang_access_token';
const REFRESH_TOKEN_KEY = 'dunfang_refresh_token';
const USER_KEY = 'dunfang_user';

export function toCurrentUser(token: API.TokenResponse): API.CurrentUser {
  return {
    userId: token.userId,
    userid: String(token.userId),
    name: token.nickname,
    nickname: token.nickname,
    email: token.email,
    roles: token.roles,
    access: token.roles.includes('ADMIN') ? 'admin' : 'user',
  };
}

export function persistAuthSession(token: API.TokenResponse): API.CurrentUser {
  const user = toCurrentUser(token);
  localStorage.setItem(ACCESS_TOKEN_KEY, token.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(body: API.LoginParams) {
  return request<API.Result<API.TokenResponse>>('/api/auth/login', {
    method: 'POST',
    data: body,
  });
}

export async function register(body: API.RegisterParams) {
  return request<API.Result<API.TokenResponse>>('/api/auth/register', {
    method: 'POST',
    data: body,
  });
}

export async function logout() {
  const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
  try {
    await request('/api/auth/logout', {
      method: 'POST',
      params: refreshTokenValue ? { refreshToken: refreshTokenValue } : {},
    });
  } finally {
    clearAuthSession();
  }
}

export async function refreshToken(refreshToken: string) {
  return request<API.Result<API.TokenResponse>>('/api/auth/refresh', {
    method: 'POST',
    params: { refreshToken },
  });
}

export async function currentUser() {
  const response = await request<API.Result<API.CurrentUser>>(
    '/api/currentUser',
    {
      method: 'GET',
    },
  );

  if (response.code === 200 && response.data) {
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  }

  throw new Error(response.message || 'Failed to fetch current user');
}
