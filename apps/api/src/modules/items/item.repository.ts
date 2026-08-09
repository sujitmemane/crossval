import Item, { IItem } from './item.model';

export const createItem = async (item: Omit<IItem, 'organizationId'> & { organizationId: string }) => {
    return await Item.create(item);
};

export const findItemsByOrganization = async (
    organizationId: string,
    filters: { status?: IItem['status']; search?: string; page: number; limit: number }
) => {
    const query: Record<string, unknown> = { organizationId };
    if (filters.status) query.status = filters.status;
    if (filters.search) query.name = { $regex: filters.search, $options: 'i' };

    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([
        Item.find(query).skip(skip).limit(filters.limit),
        Item.countDocuments(query),
    ]);

    return { items, total };
};

export const updateItemById = async (id: string, organizationId: string, updates: Partial<IItem>) => {
    return await Item.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true });
};
