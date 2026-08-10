import { apiFetch } from '../lib/api-client';
import type { Organization, UpdateOrganizationPayload } from '../types/organization';

export const organizationsApi = {
  getMe: () => apiFetch<Organization>('/organizations/me'),

  updateMe: (payload: UpdateOrganizationPayload) =>
    apiFetch<Organization>('/organizations/me', { method: 'PATCH', data: payload }),
};
