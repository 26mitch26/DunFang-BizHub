import React, { useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Upload, message, Input, Button, Form, Typography, Space, Spin, Descriptions, Table } from 'antd';
import { InboxOutlined, KeyOutlined } from '@ant-design/icons';
import { parseInvoice } from '@/services/dunfang/invoice';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const InvoiceOCR: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // 将 apiKey 保存在 localStorage 中，提升体验
  React.useEffect(() => {
    const savedKey = localStorage.getItem('dashscope_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('dashscope_api_key', val);
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    if (!apiKey) {
      message.warning('请先配置阿里云 DashScope API Key');
      onError(new Error('Missing API Key'));
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      // 调用我们在 services/dunfang/invoice 中定义的接口
      const res = await parseInvoice(file as File, apiKey);
      if (res.code === 200) {
        message.success('发票解析成功！');
        setResult(res.data);
        onSuccess(res.data, file);
      } else {
        message.error(`解析失败: ${res.message}`);
        onError(new Error(res.message));
      }
    } catch (error: any) {
      message.error(`解析发生错误: ${error.message}`);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ProCard direction="column" ghost gutter={[0, 16]}>
        <ProCard title="1. 授权配置" bordered headerBordered>
          <Form layout="vertical">
            <Form.Item
              label="阿里云 DashScope API Key"
              tooltip="用于调用 Qwen-VL-Plus 大模型进行发票 OCR 识别。仅在您的浏览器中缓存。"
              required
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="请输入您的 API Key，例如: sk-xxxxxxxxxxxxxx"
                value={apiKey}
                onChange={handleKeyChange}
              />
            </Form.Item>
          </Form>
        </ProCard>

        <ProCard title="2. 上传发票" bordered headerBordered>
          <Spin spinning={loading} tip="大模型正在思考和提取发票信息，请稍候 (约需 5-10 秒)...">
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
              <p className="ant-upload-text">点击或将发票图片拖拽到此处上传</p>
              <p className="ant-upload-hint">
                支持 JPG, PNG, WEBP 格式。采用通义千问多模态大模型实时进行全自动结构化信息提取。
              </p>
            </Dragger>
          </Spin>
        </ProCard>

        {result && (
          <ProCard title="3. 解析结果 (JSON 结构化)" bordered headerBordered>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="发票号码">{result.invoiceNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="开票日期">{result.invoiceDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="购买方名称">{result.buyerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="购买方税号">{result.buyerTaxId || '-'}</Descriptions.Item>
              <Descriptions.Item label="销售方名称">{result.sellerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="价税合计(元)">
                <Text type="danger" strong>{result.totalAmount}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="总税额(元)">{result.taxAmount}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>商品与服务明细</Title>
              <Table
                dataSource={result.items || []}
                rowKey={(record, index) => String(index)}
                pagination={false}
                bordered
                columns={[
                  { title: '项目名称', dataIndex: 'name' },
                  { title: '数量', dataIndex: 'quantity' },
                  { title: '单价', dataIndex: 'unitPrice' },
                  { 
                    title: '小计', 
                    render: (_, record: any) => 
                      (record.quantity && record.unitPrice) 
                        ? (record.quantity * record.unitPrice).toFixed(2) 
                        : '-' 
                  },
                ]}
              />
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button type="primary">确认对账并入库</Button>
                <Button>重新上传</Button>
              </Space>
            </div>
          </ProCard>
        )}
      </ProCard>
    </PageContainer>
  );
};

export default InvoiceOCR;
