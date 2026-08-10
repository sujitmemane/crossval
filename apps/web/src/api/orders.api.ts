import { apiFetch } from '../lib/api-client';
import type { OrdersResponse } from '../types/order';

export const ordersApi = {
  list: (params?: { limit?: number }) => apiFetch<OrdersResponse>('/orders', { params }),
};
