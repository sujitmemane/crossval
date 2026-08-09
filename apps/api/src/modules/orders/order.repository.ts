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
    dueDate?: Date;
    items?: OrderItemInput[];
    totalAmount?: number;
}

export const createOrder = async (order: CreateOrderInput) => {
    return await Order.create(order);
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

export const updateOrderById = async (id: string, organizationId: string, updates: UpdateOrderInput) => {
    return await Order.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true });
};
