import { Request, Response } from 'express';
import * as auditLogService from './audit-log.service';

interface AuditLogQuery {
    page: number;
    limit: number;
}

export const getAuditLogs = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const query = req.query as unknown as AuditLogQuery;
    const result = await auditLogService.getAuditLogs(organizationId, query);
    res.status(200).json(result);
};

export const getAuditLogsForOrder = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const orderId = req.params.orderId as string;
    const result = await auditLogService.getAuditLogsForOrder(organizationId, orderId);
    res.status(200).json(result);
};
