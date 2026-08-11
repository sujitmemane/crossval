import mongoose from 'mongoose';
import { AppError } from '../../lib/errors';
import { success } from '../../lib/response';
import { calculateOrderTotal } from '../../domain/order/calculate-total';
import { isOrderUpdateAllowed } from '../../domain/order/order-update';
import {
    createOrder as createOrderRepo,
    findOrderById,
    findOrdersByOrganization,
    getOrderStats as getOrderStatsRepo,
    updateOrderById,
} from './order.repository';
import { findItemsByIds } from '../items/item.repository';
import { findUserById } from '../users/user.repository';
import { deriveOrderStatus } from '../../domain/order/derive-status';
import { recordAuditLog } from '../audit-logs/audit-log.service';

const resolveOrderItems = async (
    organizationId: string,
    items: { itemId: string; quantity: number }[]
) => {
    const itemIds = items.map((item) => item.itemId);
    const foundItems = await findItemsByIds(itemIds, organizationId);

    if (foundItems.length !== new Set(itemIds).size) {
        throw new AppError('One or more items not found', 400);
    }

    const unavailableItems = foundItems.filter((item) => item.status !== 'AVAILABLE');
    if (unavailableItems.length > 0) {
        throw new AppError(`Item "${unavailableItems[0].name}" is not available`, 400);
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await createOrderRepo({
            organizationId,
            userId: input.userId,
            dueDate: input.dueDate,
            items: orderItems,
            totalAmount,
        }, session);

        await recordAuditLog({
            organizationId,
            userId: input.userId,
            orderId: order._id.toString(),
            action: 'ORDER_CREATED',
        }, session);

        await session.commitTransaction();

        return success('Order created successfully', order);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getOrderStats = async (organizationId: string) => {
    const stats = await getOrderStatsRepo(organizationId);
    return success('Order stats fetched successfully', stats);
};

export const getOrders = async (
    organizationId: string,
    filters: { userId?: string; page: number; limit: number }
) => {
    const { orders, total } = await findOrdersByOrganization(organizationId, filters);

    const ordersWithStatus = orders.map((order) => ({
        ...order,
        status: deriveOrderStatus({
            totalAmount: order.totalAmount,
            amountPaid: order.amountPaid,
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
    userId: string,
    id: string,
    updates: { userId?: string; dueDate?: Date; items?: { itemId: string; quantity: number }[] }
) => {
    const patch: {
        userId?: string;
        dueDate?: Date;
        items?: { itemId: string; quantity: number; rate: number }[];
        totalAmount?: number;
    } = {};

    let currentOrder: Awaited<ReturnType<typeof findOrderById>> = null;
    if (updates.items || updates.userId) {
        currentOrder = await findOrderById(id, organizationId);
        if (!currentOrder) throw new AppError('Order not found', 404);
    }

    if (updates.dueDate) patch.dueDate = updates.dueDate;

    if (updates.items) {
        const orderItems = await resolveOrderItems(organizationId, updates.items);

        if (!isOrderUpdateAllowed(currentOrder!.amountPaid, currentOrder!.totalAmount, orderItems)) {
            throw new AppError('Order cannot be edited: it is either fully paid or the new total would drop below the amount already paid', 400);
        }

        patch.items = orderItems;
        patch.totalAmount = calculateOrderTotal(orderItems);
    }

    if (updates.userId) {
        const newUser = await findUserById(updates.userId, organizationId);
        if (!newUser) throw new AppError('User not found', 404);

        patch.userId = updates.userId;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await updateOrderById(id, organizationId, patch, session);
        if (!order) throw new AppError('Order not found', 404);

        if (patch.dueDate) {
            await recordAuditLog({
                organizationId,
                userId,
                orderId: id,
                action: 'ORDER_DUE_DATE_UPDATED',
                metadata: { oldDueDate: currentOrder?.dueDate, newDueDate: patch.dueDate },
            }, session);
        }

        if (patch.items) {
            await recordAuditLog({
                organizationId,
                userId,
                orderId: id,
                action: 'ORDER_ITEMS_UPDATED',
                metadata: { oldItems: currentOrder?.items, newItems: patch.items, oldTotalAmount: currentOrder?.totalAmount, newTotalAmount: patch.totalAmount },
            }, session);
        }

        if (patch.userId) {
            await recordAuditLog({
                organizationId,
                userId,
                orderId: id,
                action: 'ORDER_CUSTOMER_REASSIGNED',
                metadata: { fromUserId: currentOrder?.userId.toString(), toUserId: patch.userId },
            }, session);
        }

        await session.commitTransaction();

        return success('Order updated successfully', order);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
