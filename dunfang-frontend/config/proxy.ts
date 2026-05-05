/**
 * @name 代理配置 - DunFang BizHub
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    '/api/': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  test: {
    '/api/': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  pre: {
    '/api/': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
};
