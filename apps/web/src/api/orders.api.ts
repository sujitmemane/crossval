import { apiFetch } from '../lib/api-client';
import { downloadFile } from '../lib/download-file';
import type { CreateOrderPayload, Order, OrderStats, OrdersResponse, UpdateOrderPayload } from '../types/order';

export const ordersApi = {
  list: (params?: { limit?: number }) => apiFetch<OrdersResponse>('/orders', { params }),
  create: (payload: CreateOrderPayload) => apiFetch<Order>('/orders', { method: 'POST', data: payload }),
  update: (id: string, payload: UpdateOrderPayload) =>
    apiFetch<Order>(`/orders/${id}`, { method: 'PATCH', data: payload }),
  stats: () => apiFetch<OrderStats>('/orders/stats'),
  exportCsv: (params: { startDate: string; endDate: string }) =>
    downloadFile('/orders/export', params, `orders-${params.startDate}-${params.endDate}.csv`),
};
