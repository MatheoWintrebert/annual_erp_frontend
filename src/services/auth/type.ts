export interface RegisterResponse {
  token: string;
  qrCode: string;
}

export interface RegistrerRequestParams {
  email: string;
  password: string;
  code: string;
}

export interface LoginRequestParams {
  email: string;
  password: string;
  code: string;
}

export interface LoginResponse {
  user: unknown;
  token: string;
}

export interface TwoFactorAuthRequestParams {
  code: string;
}

export interface TwoFactorAuthResponse {
  token: string;
  user: unknown;
}
