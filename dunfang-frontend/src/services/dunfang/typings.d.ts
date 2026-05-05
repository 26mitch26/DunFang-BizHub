// DunFang BizHub API type definitions

declare namespace API {
  /** Unified backend response */
  type Result<T> = {
    code: number;
    message: string;
    data: T;
  };

  /** Token response from auth endpoints */
  type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    userId: number;
    email: string;
    nickname: string;
    roles: string[];
  };

  /** Current user info stored in frontend */
  type CurrentUser = {
    userId: number;
    email: string;
    nickname: string;
    avatar?: string;
    roles: string[];
    access: string;
  };

  /** Login parameters */
  type LoginParams = {
    email: string;
    password: string;
  };

  /** Register parameters */
  type RegisterParams = {
    email: string;
    password: string;
    phone?: string;
    nickname?: string;
  };

  /** Login result for compatibility with Ant Design Pro */
  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };
}
