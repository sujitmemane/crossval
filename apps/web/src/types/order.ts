import type { PaginationMeta } from './pagination';

export type OrderStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface OrderLineItem {
  _id: string;
  itemId: string;
  quantity: number;
  rate: number;
}

export interface Order {
  _id: string;
  organizationId: string;
  userId: string;
  dueDate: string;
  items: OrderLineItem[];
  totalAmount: number;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithStatus extends Order {
  status: OrderStatus;
}

export interface OrdersResponse {
  orders: OrderWithStatus[];
  pagination: PaginationMeta;
}

export interface CreateOrderPayload {
  userId: string;
  dueDate: string;
  items: { itemId: string; quantity: number }[];
}

export interface UpdateOrderPayload {
  userId?: string;
  dueDate?: string;
  items?: { itemId: string; quantity: number }[];
}

export interface OrderStats {
  totalOrders: number;
  totalOrderValue: number;
  totalCollected: number;
  amountDue: number;
  overdueAmount: number;
  overdueOrders: number;
}
