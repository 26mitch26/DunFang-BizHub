import { Link, useSearchParams } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';
import useStyles from './style.style';

const RegisterResult: React.FC<Record<string, unknown>> = () => {
  const { styles } = useStyles();
  const [params] = useSearchParams();

  const actions = (
    <div className={styles.actions}>
      <a href="">
        <Button size="large" type="primary">
          <span>查看邮箱</span>
        </Button>
      </a>
      <Link to="/" prefetch>
        <Button size="large">返回首页</Button>
      </Link>
    </div>
  );

  const email = params?.get('account') || 'demo@dunfang-bizhub.com';
  return (
    <Result
      className={styles.registerResult}
      status="success"
      title={
        <div className={styles.title}>
          <span>你的账号 {email} 注册成功</span>
        </div>
      }
      subTitle="激活邮件已发送至你的邮箱，有效期为 24 小时。请尽快完成激活。"
      extra={actions}
    />
  );
};

export default RegisterResult;
