import { Router } from 'express';
import { getMyOrganization, updateMyOrganization } from './organization.controller';
import { authenticate, requireOrganization, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateOrganizationSchema } from './organization.schema';

const organizationRouter = Router();

organizationRouter.get('/me', authenticate, requireOrganization, getMyOrganization);
organizationRouter.patch('/me', authenticate, requireOrganization, requireRole('ADMIN'), validate(updateOrganizationSchema), updateMyOrganization);

export default organizationRouter;
