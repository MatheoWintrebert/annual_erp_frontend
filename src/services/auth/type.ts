export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape returned by GET /user. It does not expose the 2FA flag.
 */
export interface ShortUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UsersListResponse = ShortUser[];

export interface RegisterResponse {
  token: string;
  qrCode: string;
}

export interface RegistrerRequestParams {
  email: string;
  password: string;
  code: string;
}

/** Step 1 of the login: email + password only. */
export interface LoginRequestParams {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

/** Step 2 of the login: validate the TOTP code. */
export interface TwoFactorAuthRequestParams {
  code: string;
}

export interface TwoFactorAuthResponse {
  token: string;
}

/** POST /auth/2fa/generate returns the otpauth URI + the raw secret. */
export interface Generate2FAResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface EditPasswordParams {
  oldPassword: string;
  newPassword: string;
}

export interface CreateUserParams {
  email: string;
}

export interface CreateUserResponse {
  password: string;
}
