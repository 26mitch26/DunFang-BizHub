import { request } from '@umijs/max';

/**
 * 智能解析发票图片
 * 考虑到可能直连Python服务或经过Java转发，这里我们将其指向 Java 后端，由 Java 后端组装并调用 Python。
 */
export async function parseInvoice(
  file: File,
  apiKey: string,
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request<API.Result>('/api/invoices/parse', {
    method: 'POST',
    data: formData,
    headers: {
      'X-DashScope-Api-Key': apiKey,
    },
    ...(options || {}),
  });
}
