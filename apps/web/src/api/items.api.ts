import { apiFetch } from '../lib/api-client';
import type { ItemsResponse } from '../types/item';

export const itemsApi = {
  list: () => apiFetch<ItemsResponse>('/items'),
};
