import { apiFetch } from '../lib/api-client';
import type {
  AuthSession,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
} from '../types/auth';

export const authApi = {
  signUp: (payload: SignUpPayload) =>
    apiFetch<AuthSession>('/auth/sign-up', { method: 'POST', data: payload, skipAuth: true }),

  signIn: (payload: SignInPayload) =>
    apiFetch<AuthSession>('/auth/sign-in', { method: 'POST', data: payload, skipAuth: true }),

  signOut: () => apiFetch('/auth/sign-out', { method: 'POST', skipAuth: true }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiFetch('/auth/forgot-password', { method: 'POST', data: payload, skipAuth: true }),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiFetch('/auth/reset-password', { method: 'POST', data: payload, skipAuth: true }),
};
