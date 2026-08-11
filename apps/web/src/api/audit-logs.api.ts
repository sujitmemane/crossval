import { apiFetch } from '../lib/api-client';
import type { AuditLog } from '../types/audit-log';

export const auditLogsApi = {
  listByOrder: (orderId: string) => apiFetch<AuditLog[]>(`/audit-logs/order/${orderId}`),
};
