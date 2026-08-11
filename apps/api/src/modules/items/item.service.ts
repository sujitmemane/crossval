import { AppError } from '../../lib/errors';
import { success } from '../../lib/response';
import { IItem } from './item.model';
import {
    createItem as createItemRepo,
    findItemsByOrganization,
    updateItemById,
} from './item.repository';

export const createItem = async (organizationId: string, input: Omit<IItem, 'organizationId'>) => {
    const item = await createItemRepo({ ...input, organizationId });
    return success('Item created successfully', item);
};

export const getItems = async (
    organizationId: string,
    filters: { status?: IItem['status']; search?: string; page: number; limit: number }
) => {
    const { items, total } = await findItemsByOrganization(organizationId, filters);
    return success('Items fetched successfully', {
        items,
        pagination: { page: filters.page, limit: filters.limit, total },
    });
};

export const updateItem = async (organizationId: string, id: string, updates: Partial<IItem>) => {
    console.log("update item", id, organizationId, updates);
    const item = await updateItemById(id, organizationId, updates);
    if (!item) throw new AppError('Item not found', 404);
    return success('Item updated successfully', item);
};
