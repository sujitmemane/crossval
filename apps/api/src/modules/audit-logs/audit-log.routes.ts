import { Router } from 'express';
import { getAuditLogs, getAuditLogsForOrder } from './audit-log.controller';
import { authenticate, requireOrganization } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getAuditLogsSchema } from './audit-log.schema';

const auditLogRouter = Router();

auditLogRouter.get('/', authenticate, requireOrganization, validate(getAuditLogsSchema, 'query'), getAuditLogs);
auditLogRouter.get('/order/:orderId', authenticate, requireOrganization, getAuditLogsForOrder);

export default auditLogRouter;
