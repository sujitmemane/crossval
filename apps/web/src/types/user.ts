import type { UserRole } from './auth';
import type { PaginationMeta } from './pagination';

export interface OrgUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  isOrganizationConfigured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: OrgUser[];
  pagination: PaginationMeta;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
