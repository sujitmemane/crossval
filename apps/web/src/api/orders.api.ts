import { apiFetch } from '../lib/api-client';
import type { CreateOrderPayload, Order, OrderStats, OrdersResponse, UpdateOrderPayload } from '../types/order';

export const ordersApi = {
  list: (params?: { limit?: number }) => apiFetch<OrdersResponse>('/orders', { params }),
  create: (payload: CreateOrderPayload) => apiFetch<Order>('/orders', { method: 'POST', data: payload }),
  update: (id: string, payload: UpdateOrderPayload) =>
    apiFetch<Order>(`/orders/${id}`, { method: 'PATCH', data: payload }),
  stats: () => apiFetch<OrderStats>('/orders/stats'),
};
