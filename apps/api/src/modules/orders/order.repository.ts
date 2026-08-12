import mongoose from 'mongoose';
import { Order } from './order.model';

interface OrderItemInput {
    itemId: string;
    quantity: number;
    rate: number;
}

interface CreateOrderInput {
    organizationId: string;
    userId: string;
    dueDate: Date;
    items: OrderItemInput[];
    totalAmount: number;
}

interface UpdateOrderInput {
    userId?: string;
    dueDate?: Date;
    items?: OrderItemInput[];
    totalAmount?: number;
}

export const createOrder = async (order: CreateOrderInput, session?: mongoose.ClientSession) => {
    const [created] = await Order.create([order], { session });
    return created;
};

export const findOrderById = async (id: string, organizationId: string) => {
    return await Order.findOne({ _id: id, organizationId });
};

export const findOrdersByOrganization = async (
    organizationId: string,
    filters: { userId?: string; page: number; limit: number }
) => {
    const query: Record<string, unknown> = { organizationId };
    if (filters.userId) query.userId = filters.userId;

    const skip = (filters.page - 1) * filters.limit;
    const [orders, total] = await Promise.all([
        Order.find(query).skip(skip).limit(filters.limit).lean(),
        Order.countDocuments(query),
    ]);

    return { orders, total };
};

export const countOrdersByDateRange = async (organizationId: string, startDate: Date, endDate: Date) => {
    return await Order.countDocuments({
        organizationId,
        createdAt: { $gte: startDate, $lte: endDate },
    });
};

export const iterateOrdersByDateRange = (
    organizationId: string,
    startDate: Date,
    endDate: Date
) => {
    return Order.find({
        organizationId,
        createdAt: { $gte: startDate, $lte: endDate },
    })
        .sort({ createdAt: 1 })
        .lean()
        .cursor({ batchSize: 500 });
};

export const updateOrderById = async (
    id: string,
    organizationId: string,
    updates: UpdateOrderInput,
    session?: mongoose.ClientSession
) => {
    return await Order.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true, session });
};

export const getOrderStats = async (organizationId: string) => {
    const now = new Date();

    const [result] = await Order.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalOrderValue: { $sum: '$totalAmount' },
                totalCollected: { $sum: '$amountPaid' },
                overdueAmount: {
                    $sum: {
                        $cond: [
                            { $and: [{ $lt: ['$amountPaid', '$totalAmount'] }, { $lt: ['$dueDate', now] }] },
                            { $subtract: ['$totalAmount', '$amountPaid'] },
                            0,
                        ],
                    },
                },
                overdueOrders: {
                    $sum: {
                        $cond: [
                            { $and: [{ $lt: ['$amountPaid', '$totalAmount'] }, { $lt: ['$dueDate', now] }] },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    const totalOrders = result?.totalOrders ?? 0;
    const totalOrderValue = result?.totalOrderValue ?? 0;
    const totalCollected = result?.totalCollected ?? 0;

    return {
        totalOrders,
        totalOrderValue,
        totalCollected,
        amountDue: totalOrderValue - totalCollected,
        overdueAmount: result?.overdueAmount ?? 0,
        overdueOrders: result?.overdueOrders ?? 0,
    };
};

export const applyOrderPayment = async (
    id: string,
    organizationId: string,
    signedAmount: number,
    session: mongoose.ClientSession
) => {
    return await Order.findOneAndUpdate(
        {
            _id: id,
            organizationId,
            $expr: {
                $and: [
                    { $gte: [{ $add: ['$amountPaid', signedAmount] }, 0] },
                    { $lte: [{ $add: ['$amountPaid', signedAmount] }, '$totalAmount'] },
                ],
            },
        },
        { $inc: { amountPaid: signedAmount } },
        { new: true, session }
    );
};
