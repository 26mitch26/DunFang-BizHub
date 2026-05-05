import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Input, List, Space, Tag, Typography, message, Spin } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  BulbOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WarningOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import React, { useState, useRef, useEffect } from 'react';
import { agentChat } from '@/services/dunfang/agent';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const quickQuestions = [
  { text: '帮我分析一下当前的销售订单情况', icon: <ShoppingOutlined /> },
  { text: '哪些商品库存不足需要补货？', icon: <WarningOutlined /> },
  { text: '本月有哪些待跟进的客户？', icon: <TeamOutlined /> },
  { text: '发票对账的整体情况如何？', icon: <FileTextOutlined /> },
];

const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '你好！我是 DunFang BizHub 智能业务助手。我可以帮你分析销售数据、库存状态、客户跟进情况和财务对账等业务问题。请问有什么需要了解的？',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await agentChat({ question: text.trim() });
      if (res?.data?.answer) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data!.answer, timestamp: Date.now() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '抱歉，未能获取到有效回复。请确认 AI Worker 服务是否已启动，并检查 API Key 配置。',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      message.error('AI 助手请求失败，请检查网络或 AI Worker 服务');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '请求失败，请确认后端服务和 AI Worker 是否正在运行。',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="AI 智能业务助手"
      subTitle="基于大模型的业务数据分析问答"
    >
      <Card
        style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        <div
          ref={listRef}
          style={{ flex: 1, overflow: 'auto', padding: '16px 24px', background: '#fafafa' }}
        >
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item
                style={{
                  border: 'none',
                  padding: '8px 0',
                  background: 'transparent',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Space align="start" direction={msg.role === 'user' ? 'horizontal' : 'horizontal'} style={{ maxWidth: '80%' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#1677ff', flexShrink: 0 }}>
                      <RobotOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                  )}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: msg.role === 'user' ? '#1677ff' : '#fff',
                      color: msg.role === 'user' ? '#fff' : '#000',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.7,
                      fontSize: 14,
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#87d068', flexShrink: 0 }}>
                      <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                  )}
                </Space>
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin tip="AI 正在分析中..." />
            </div>
          )}
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          <div style={{ marginBottom: 8 }}>
            <Space size={[8, 8]} wrap>
              {quickQuestions.map((q, i) => (
                <Tag
                  key={i}
                  icon={q.icon}
                  color="blue"
                  style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}
                  onClick={() => sendMessage(q.text)}
                >
                  {q.text}
                </Tag>
              ))}
            </Space>
          </div>
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入业务问题，例如：本月销售额最高的客户是哪个？"
              autoSize={{ minRows: 1, maxRows: 3 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputValue);
                }
              }}
              style={{ borderRadius: '8px 0 0 8px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => sendMessage(inputValue)}
              loading={loading}
              style={{ height: 'auto', borderRadius: '0 8px 8px 0' }}
            >
              发送
            </Button>
          </Space.Compact>
        </div>
      </Card>
    </PageContainer>
  );
};

export default AiAssistantPage;
