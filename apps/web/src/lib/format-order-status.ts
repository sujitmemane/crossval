import type { OrderStatus } from '../types/order';

export function formatOrderStatus(status: OrderStatus): string {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export const orderStatusTone = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'danger',
  PENDING: 'neutral',
} as const;
