import { apiFetch } from '../lib/api-client';
import type { CreateTransactionPayload, CreateTransactionResult, Transaction } from '../types/transaction';

export const transactionsApi = {
  listByOrder: (orderId: string) => apiFetch<Transaction[]>('/transactions', { params: { orderId } }),

  create: (payload: CreateTransactionPayload) =>
    apiFetch<CreateTransactionResult>('/transactions', { method: 'POST', data: payload }),
};
