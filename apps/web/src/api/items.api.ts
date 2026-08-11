import { apiFetch } from '../lib/api-client';
import type { CreateItemPayload, Item, ItemStatus, ItemsResponse } from '../types/item';

export const itemsApi = {
  list: (params?: { status?: ItemStatus }) => apiFetch<ItemsResponse>('/items', { params }),
  create: (payload: CreateItemPayload) => apiFetch<Item>('/items', { method: 'POST', data: payload }),
  update: (id: string, payload: Partial<CreateItemPayload>) =>
    apiFetch<Item>(`/items/${id}`, { method: 'PATCH', data: payload }),
};
