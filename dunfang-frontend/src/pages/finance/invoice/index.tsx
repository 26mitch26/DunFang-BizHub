import { InboxOutlined, KeyOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { UploadProps } from 'antd';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import React, { useMemo, useState } from 'react';

import { parseInvoice } from '@/services/dunfang/invoice';

const { Dragger } = Upload;
const { Paragraph, Text, Title } = Typography;

type InvoiceItem = {
  name?: string;
  quantity?: number;
  unitPrice?: number;
};

const invoiceStatusMap: Record<string, { color: string; text: string }> = {
  MATCHED: { color: 'success', text: '已匹配订单' },
  UNMATCHED: { color: 'warning', text: '待人工核对' },
};

const InvoiceOCR: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<API.InvoiceRecord | null>(null);

  React.useEffect(() => {
    const savedKey = localStorage.getItem('dashscope_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const items = useMemo<InvoiceItem[]>(() => {
    if (!result?.itemsJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(result.itemsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [result]);

  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setApiKey(nextValue);
    localStorage.setItem('dashscope_api_key', nextValue);
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    if (!apiKey) {
      const nextError = new Error('Missing API Key');
      message.warning('请先填写 DashScope API Key');
      onError?.(nextError);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await parseInvoice(file as File, apiKey);
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || '发票识别失败');
      }

      setResult(response.data);
      message.success('发票识别完成');
      onSuccess?.(response.data);
    } catch (error) {
      const nextError =
        error instanceof Error ? error : new Error('发票识别失败');
      message.error(nextError.message);
      onError?.(nextError);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus =
    result?.status && invoiceStatusMap[result.status]
      ? invoiceStatusMap[result.status]
      : undefined;

  return (
    <PageContainer
      title="发票智能提取"
      subTitle="上传发票图片，调用 AI Worker 解析结构化字段并尝试匹配销售订单"
    >
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Card title="1. API Key">
          <Form layout="vertical">
            <Form.Item
              label="DashScope API Key"
              tooltip="仅保存在当前浏览器中，用于调用 AI Worker 背后的识别能力。"
              required
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="请输入 DashScope API Key"
                value={apiKey}
                onChange={handleKeyChange}
              />
            </Form.Item>
          </Form>
        </Card>

        <Card title="2. 上传发票">
          <Spin spinning={loading} tip="正在识别发票，请稍候...">
            <Dragger
              name="file"
              multiple={false}
              customRequest={customRequest}
              showUploadList={false}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽发票图片到这里上传</p>
              <p className="ant-upload-hint">
                支持 JPG、PNG、WEBP。上传后会调用 AI Worker 做结构化提取。
              </p>
            </Dragger>
          </Spin>
        </Card>

        {result && (
          <Card title="3. 识别结果">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="发票号码">
                {result.invoiceNo || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="开票日期">
                {result.invoiceDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="购买方名称">
                {result.buyerName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="购买方税号">
                {result.buyerTaxId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="销售方名称">
                {result.sellerName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="匹配状态">
                {currentStatus ? <Tag color={currentStatus.color}>{currentStatus.text}</Tag> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="价税合计">
                <Text strong type="danger">
                  {result.totalAmount ?? '-'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="税额">
                {result.taxAmount ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="匹配订单 ID" span={2}>
                {result.matchedOrderId ?? '未匹配'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>商品明细</Title>
              {items.length > 0 ? (
                <Table<InvoiceItem>
                  dataSource={items}
                  rowKey={(_, index) => String(index)}
                  pagination={false}
                  bordered
                  columns={[
                    { title: '项目名称', dataIndex: 'name' },
                    { title: '数量', dataIndex: 'quantity' },
                    { title: '单价', dataIndex: 'unitPrice' },
                    {
                      title: '小计',
                      render: (_, record) =>
                        record.quantity && record.unitPrice
                          ? (record.quantity * record.unitPrice).toFixed(2)
                          : '-',
                    },
                  ]}
                />
              ) : (
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  当前识别结果没有返回商品明细。
                </Paragraph>
              )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Button onClick={() => setResult(null)}>继续识别下一张</Button>
            </div>
          </Card>
        )}
      </Space>
    </PageContainer>
  );
};

export default InvoiceOCR;
