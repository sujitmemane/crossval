import mongoose from 'mongoose';
import AuditLog, { AuditAction } from './audit-log.model';

interface CreateAuditLogInput {
    organizationId: string;
    userId: string;
    orderId: string;
    action: AuditAction;
    metadata?: Record<string, unknown>;
}

export const createAuditLog = async (entry: CreateAuditLogInput, session?: mongoose.ClientSession) => {
    const [created] = await AuditLog.create([entry], { session });
    return created;
};

export const findAuditLogsByOrder = async (organizationId: string, orderId: string) => {
    return await AuditLog.find({ organizationId, orderId }).sort({ createdAt: -1 }).lean();
};

export const findAuditLogsByOrganization = async (
    organizationId: string,
    filters: { page: number; limit: number }
) => {
    const query: Record<string, unknown> = { organizationId };

    const skip = (filters.page - 1) * filters.limit;
    const [logs, total] = await Promise.all([
        AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(filters.limit).lean(),
        AuditLog.countDocuments(query),
    ]);

    return { logs, total };
};
