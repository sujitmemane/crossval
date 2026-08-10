import { apiFetch } from '../lib/api-client';
import type { Transaction } from '../types/transaction';

export const transactionsApi = {
  listByOrder: (orderId: string) => apiFetch<Transaction[]>('/transactions', { params: { orderId } }),
};
