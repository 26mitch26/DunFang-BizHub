// @ts-ignore
import { TestBrowser } from '@@/testBrowser';
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { login, persistAuthSession } from '@/services/dunfang/auth';

jest.mock('@/services/dunfang/auth', () => ({
  login: jest.fn(),
  persistAuthSession: jest.fn(() => ({
    userId: 1,
    userid: '1',
    name: 'Admin',
    nickname: 'Admin',
    email: 'admin@example.com',
    roles: ['ADMIN'],
    access: 'admin',
  })),
}));

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the login form with the project branding', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/user/login',
        }}
      />,
    );

    expect(await rootContainer.findByText('DunFang BizHub')).toBeTruthy();
    expect(
      rootContainer.getByText('面向分销场景的经营协同与发票识别平台'),
    ).toBeTruthy();
    expect(rootContainer.getByPlaceholderText('邮箱地址')).toBeTruthy();
    expect(rootContainer.getByPlaceholderText('密码')).toBeTruthy();

    rootContainer.unmount();
  });

  it('submits email and password, then navigates to the overview page', async () => {
    (login as jest.Mock).mockResolvedValue({
      code: 200,
      message: 'success',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        userId: 1,
        email: 'admin@example.com',
        nickname: 'Admin',
        roles: ['ADMIN'],
      },
    });

    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/user/login',
        }}
      />,
    );

    const emailInput = await rootContainer.findByPlaceholderText('邮箱地址');
    const passwordInput = await rootContainer.findByPlaceholderText('密码');

    fireEvent.change(emailInput, {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    });

    fireEvent.click(
      await rootContainer.findByRole('button', { name: /登\s*录/ }),
    );

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password123',
        autoLogin: true,
      });
      expect(persistAuthSession).toHaveBeenCalled();
    });

    expect(
      await rootContainer.findByText('项目摘要', undefined, {
        timeout: 10000,
      }),
    ).toBeTruthy();

    rootContainer.unmount();
  });
});
