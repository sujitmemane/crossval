export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  isOrganizationConfigured?: boolean;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  organizationName: string;
  country: string;
  currency: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
