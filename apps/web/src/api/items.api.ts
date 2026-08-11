import { apiFetch } from '../lib/api-client';
import type { CreateItemPayload, Item, ItemsResponse } from '../types/item';

export const itemsApi = {
  list: () => apiFetch<ItemsResponse>('/items'),
  create: (payload: CreateItemPayload) => apiFetch<Item>('/items', { method: 'POST', data: payload }),
  update: (id: string, payload: Partial<CreateItemPayload>) =>
    apiFetch<Item>(`/items/${id}`, { method: 'PATCH', data: payload }),
};
