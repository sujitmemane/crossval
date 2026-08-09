import mongoose from 'mongoose';
import { success } from '../../lib/response';
import { AuditAction } from './audit-log.model';
import { createAuditLog, findAuditLogsByOrder, findAuditLogsByOrganization } from './audit-log.repository';

export const recordAuditLog = async (
    entry: {
        organizationId: string;
        userId: string;
        orderId: string;
        action: AuditAction;
        metadata?: Record<string, unknown>;
    },
    session?: mongoose.ClientSession
) => {
    return await createAuditLog(entry, session);
};

export const getAuditLogsForOrder = async (organizationId: string, orderId: string) => {
    const logs = await findAuditLogsByOrder(organizationId, orderId);
    return success('Audit logs fetched successfully', logs);
};

export const getAuditLogs = async (
    organizationId: string,
    filters: { page: number; limit: number }
) => {
    const { logs, total } = await findAuditLogsByOrganization(organizationId, filters);
    return success('Audit logs fetched successfully', {
        logs,
        pagination: { page: filters.page, limit: filters.limit, total },
    });
};
