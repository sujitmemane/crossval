import { Router } from 'express';
import { createOrder, getOrders, getOrderStats, updateOrder } from './order.controller';
import { authenticate, requireOrganization } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrderSchema, getOrdersSchema, updateOrderSchema } from './order.schema';

const orderRouter = Router();

orderRouter.post('/', authenticate, requireOrganization, validate(createOrderSchema), createOrder);
orderRouter.get('/stats', authenticate, requireOrganization, getOrderStats);
orderRouter.get('/', authenticate, requireOrganization, validate(getOrdersSchema, 'query'), getOrders);
orderRouter.patch('/:id', authenticate, requireOrganization, validate(updateOrderSchema), updateOrder);

export default orderRouter;
