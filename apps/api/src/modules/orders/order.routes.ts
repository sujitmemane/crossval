import { Router } from 'express';
import { createOrder, exportOrders, getOrders, getOrderStats, updateOrder } from './order.controller';
import { authenticate, requireOrganization } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrderSchema, exportOrdersSchema, getOrdersSchema, updateOrderSchema } from './order.schema';

const orderRouter = Router();

orderRouter.post('/', authenticate, requireOrganization, validate(createOrderSchema), createOrder);
orderRouter.get('/stats', authenticate, requireOrganization, getOrderStats);
orderRouter.get('/export', authenticate, requireOrganization, validate(exportOrdersSchema, 'query'), exportOrders);
orderRouter.get('/', authenticate, requireOrganization, validate(getOrdersSchema, 'query'), getOrders);
orderRouter.patch('/:id', authenticate, requireOrganization, validate(updateOrderSchema), updateOrder);

export default orderRouter;
