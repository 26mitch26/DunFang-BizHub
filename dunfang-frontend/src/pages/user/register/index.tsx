import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProFormText } from '@ant-design/pro-components';
import { Helmet, history, useModel } from '@umijs/max';
import { Alert, App, Button, Card, Form, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';

import {
  persistAuthSession,
  register,
} from '@/services/dunfang/auth';
import Settings from '../../../../config/defaultSettings';

const { Link, Text, Title } = Typography;

const useStyles = createStyles(({ token }) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      overflow: 'auto',
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgLayout} 50%, ${token.colorPrimaryBgHover} 100%)`,
      padding: '24px',
    },
    card: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: 24,
    },
  };
});

const Register: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    email: string;
    nickname?: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await register({
        email: values.email,
        password: values.password,
        phone: values.phone,
        nickname: values.nickname,
      });

      if (response.code === 200 && response.data) {
        const userInfo = persistAuthSession(response.data);
        message.success('注册成功');

        flushSync(() => {
          setInitialState((state) => ({
            ...state,
            currentUser: userInfo,
          }));
        });

        history.push('/');
        return;
      }

      setErrorMsg(response.message || '注册失败');
    } catch (error: any) {
      const nextMessage =
        error?.data?.message || error?.message || '注册失败，请重试';
      setErrorMsg(nextMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>注册 - {Settings.title}</title>
      </Helmet>
      <Card className={styles.card}>
        <div className={styles.header}>
          <img
            src={Settings.logo}
            alt="logo"
            style={{ width: 48, height: 48, marginBottom: 8 }}
          />
          <Title level={3} style={{ marginBottom: 4 }}>
            DunFang BizHub
          </Title>
          <Text type="secondary">创建你的账号</Text>
        </div>

        {errorMsg && (
          <Alert
            style={{ marginBottom: 16 }}
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg('')}
          />
        )}

        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
          <ProFormText
            name="email"
            fieldProps={{ prefix: <MailOutlined /> }}
            placeholder="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          />
          <ProFormText
            name="nickname"
            fieldProps={{ prefix: <UserOutlined /> }}
            placeholder="昵称（选填）"
          />
          <ProFormText
            name="phone"
            fieldProps={{ prefix: <PhoneOutlined /> }}
            placeholder="手机号（选填）"
            rules={[
              {
                pattern: /^1\d{10}$/,
                message: '手机号格式不正确',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{ prefix: <LockOutlined /> }}
            placeholder="密码（至少 6 位）"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          />
          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{ prefix: <LockOutlined /> }}
            placeholder="确认密码"
            rules={[{ required: true, message: '请确认密码' }]}
          />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">已有账号？</Text>
            <Link onClick={() => history.push('/user/login')}>立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
