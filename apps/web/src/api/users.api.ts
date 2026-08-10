import { apiFetch } from '../lib/api-client';
import type { AuthUser } from '../types/auth';
import type { ChangePasswordPayload, UpdateProfilePayload, UsersResponse } from '../types/user';

export const usersApi = {
  getMe: () => apiFetch<AuthUser>('/users/me'),

  updateMe: (payload: UpdateProfilePayload) => apiFetch<AuthUser>('/users/me', { method: 'PATCH', data: payload }),

  changePassword: (payload: ChangePasswordPayload) =>
    apiFetch('/users/me/password', { method: 'PATCH', data: payload }),

  list: () => apiFetch<UsersResponse>('/users'),
};
