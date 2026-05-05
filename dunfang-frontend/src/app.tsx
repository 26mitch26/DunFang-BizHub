import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { Link, history } from '@umijs/max';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';

import { AvatarDropdown, Footer } from '@/components';
import {
  clearAuthSession,
  currentUser as fetchCurrentUser,
} from '@/services/dunfang/auth';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';

dayjs.extend(relativeTime);

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const accessToken = localStorage.getItem('dunfang_access_token');
      if (accessToken) {
        return await fetchCurrentUser();
      }
    } catch (_error) {
      clearAuthSession();
    }
    return undefined;
  };

  const { location } = history;
  if (
    ![loginPath, '/user/register', '/user/register-result'].includes(
      location.pathname,
    )
  ) {
    const currentUser = await fetchUserInfo();
    if (!currentUser) {
      history.replace(
        `${loginPath}?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`,
      );
    }
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    menuItemRender: (item, dom) => {
      if (item.path) {
        return (
          <Link to={item.path} prefetch>
            {dom}
          </Link>
        );
      }
      return dom;
    },
    actionsRender: () => [],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title:
        initialState?.currentUser?.nickname ||
        initialState?.currentUser?.name ||
        'User',
      render: (_, avatarChildren) => (
        <AvatarDropdown>{avatarChildren}</AvatarDropdown>
      ),
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      if (
        !initialState?.currentUser &&
        location.pathname !== loginPath &&
        location.pathname !== '/user/register'
      ) {
        history.replace(
          `${loginPath}?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`,
        );
      }
    },
    bgLayoutImgList: [],
    links: [],
    menuHeaderRender: undefined,
    childrenRender: (children) => children,
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  baseURL: isDev ? '' : '',
  ...errorConfig,
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('dunfang_access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],
};
