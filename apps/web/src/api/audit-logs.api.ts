import { apiFetch } from '../lib/api-client';
import type { AuditLogsResponse } from '../types/audit-log';

export const auditLogsApi = {
  list: () => apiFetch<AuditLogsResponse>('/audit-logs'),
};
