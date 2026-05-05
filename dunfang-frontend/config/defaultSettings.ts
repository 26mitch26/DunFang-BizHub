import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * DunFang BizHub Default Settings
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#1677ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'DunFang BizHub',
  pwa: true,
  logo: '/icons/icon-192x192.png',
  iconfontUrl: '',
  token: {},
};

export default Settings;
