export type RegisterResponse = {
  token: string;
  qrCode: string;
};

export type RegistrerRequestParams = {
  email: string;
  password: string;
  code: string;
};

export type LoginRequestParams = {
  email: string;
  password: string;
  code: string;
};

export type LoginResponse = {
  user: any;
  token: string;
};

export type TwoFactorAuthRequestParams = {
  code: string;
};

export type TwoFactorAuthResponse = {
  token: string;
  user: any;
};
