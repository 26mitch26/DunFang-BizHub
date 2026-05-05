import { LockOutlined, MailOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, history, useModel } from '@umijs/max';
import { Alert, App } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';

import { login, persistAuthSession } from '@/services/dunfang/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      overflow: 'auto',
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgLayout} 50%, ${token.colorPrimaryBgHover} 100%)`,
    },
  };
});

const LoginMessage: React.FC<{ content: string }> = ({ content }) => (
  <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
);

const Login: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      setErrorMsg('');
      const response = await login(values);

      if (response.code === 200 && response.data) {
        const userInfo = persistAuthSession(response.data);
        message.success('登录成功');

        flushSync(() => {
          setInitialState((state) => ({
            ...state,
            currentUser: userInfo,
          }));
        });

        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }

      setErrorMsg(response.message || '登录失败');
    } catch (error: any) {
      const nextMessage =
        error?.data?.message || error?.message || '登录失败，请稍后重试';
      setErrorMsg(nextMessage);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>登录 - {Settings.title}</title>
      </Helmet>
      <div style={{ flex: '1', padding: '32px 0' }}>
        <LoginForm
          contentStyle={{ minWidth: 280, maxWidth: '75vw' }}
          logo={<img alt="logo" src={Settings.logo} />}
          title="DunFang BizHub"
          subTitle="面向分销场景的经营协同与发票识别平台"
          initialValues={{ autoLogin: true }}
          submitter={{ searchConfig: { submitText: '登录' } }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          {errorMsg && <LoginMessage content={errorMsg} />}

          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined />,
            }}
            placeholder="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />

          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a style={{ float: 'right' }} onClick={() => history.push('/user/register')}>
              注册新账号
            </a>
          </div>
        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
