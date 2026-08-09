import { AppError } from '../../lib/errors';
import { success } from '../../lib/response';
import { calculateOrderTotal } from '../../domain/order/calculate-total';
import { isOrderUpdateAllowed } from '../../domain/order/order-update';
import { createOrder as createOrderRepo, findOrderById, findOrdersByOrganization, updateOrderById } from './order.repository';
import { findItemsByIds } from '../items/item.repository';
import { getAmountPaidForOrder, getAmountPaidForOrders } from '../transactions/transaction.repository';
import { deriveOrderStatus } from '../../domain/order/derive-status';

const resolveOrderItems = async (
    organizationId: string,
    items: { itemId: string; quantity: number }[]
) => {
    const itemIds = items.map((item) => item.itemId);
    const foundItems = await findItemsByIds(itemIds, organizationId);

    if (foundItems.length !== new Set(itemIds).size) {
        throw new AppError('One or more items not found', 400);
    }

    const itemById = new Map(foundItems.map((item) => [item._id.toString(), item]));
    return items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        rate: itemById.get(item.itemId)!.rate,
    }));
};

export const createOrder = async (
    organizationId: string,
    input: { userId: string; dueDate: Date; items: { itemId: string; quantity: number }[] }
) => {
    const orderItems = await resolveOrderItems(organizationId, input.items);
    const totalAmount = calculateOrderTotal(orderItems);

    const order = await createOrderRepo({
        organizationId,
        userId: input.userId,
        dueDate: input.dueDate,
        items: orderItems,
        totalAmount,
    });

    return success('Order created successfully', order);
};

export const getOrders = async (
    organizationId: string,
    filters: { userId?: string; page: number; limit: number }
) => {
    const { orders, total } = await findOrdersByOrganization(organizationId, filters);

    const orderIds = orders.map((order) => order._id.toString());
    const amountPaidByOrder = await getAmountPaidForOrders(orderIds, organizationId);

    const ordersWithStatus = orders.map((order) => ({
        ...order,
        status: deriveOrderStatus({
            totalAmount: order.totalAmount,
            amountPaid: amountPaidByOrder.get(order._id.toString()) ?? 0,
            dueDate: order.dueDate,
        }),
    }));
    return success('Orders fetched successfully', {
        orders: ordersWithStatus,
        pagination: { page: filters.page, limit: filters.limit, total },
    });
};

export const updateOrder = async (
    organizationId: string,
    id: string,
    updates: { dueDate?: Date; items?: { itemId: string; quantity: number }[] }
) => {
    const patch: { dueDate?: Date; items?: { itemId: string; quantity: number; rate: number }[]; totalAmount?: number } = {};

    if (updates.dueDate) patch.dueDate = updates.dueDate;

    if (updates.items) {
        const currentOrder = await findOrderById(id, organizationId);
        if (!currentOrder) throw new AppError('Order not found', 404);

        const orderItems = await resolveOrderItems(organizationId, updates.items);
        const amountPaid = await getAmountPaidForOrder(id, organizationId);

        if (!isOrderUpdateAllowed(amountPaid, currentOrder.totalAmount, orderItems)) {
            throw new AppError('Order cannot be edited: it is either fully paid or the new total would drop below the amount already paid', 400);
        }

        patch.items = orderItems;
        patch.totalAmount = calculateOrderTotal(orderItems);
    }

    const order = await updateOrderById(id, organizationId, patch);
    if (!order) throw new AppError('Order not found', 404);
    return success('Order updated successfully', order);
};
