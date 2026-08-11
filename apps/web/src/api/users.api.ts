import { apiFetch } from '../lib/api-client';
import type { AuthUser } from '../types/auth';
import type {
  ChangePasswordPayload,
  CreateUserPayload,
  OrgUser,
  UpdateProfilePayload,
  UpdateUserPayload,
  UsersResponse,
} from '../types/user';

export const usersApi = {
  getMe: () => apiFetch<AuthUser>('/users/me'),

  updateMe: (payload: UpdateProfilePayload) => apiFetch<AuthUser>('/users/me', { method: 'PATCH', data: payload }),

  changePassword: (payload: ChangePasswordPayload) =>
    apiFetch('/users/me/password', { method: 'PATCH', data: payload }),

  list: () => apiFetch<UsersResponse>('/users'),

  getById: (id: string) => apiFetch<OrgUser>(`/users/${id}`),

  create: (payload: CreateUserPayload) => apiFetch<OrgUser>('/users', { method: 'POST', data: payload }),

  update: (id: string, payload: UpdateUserPayload) =>
    apiFetch<OrgUser>(`/users/${id}`, { method: 'PATCH', data: payload }),
};
