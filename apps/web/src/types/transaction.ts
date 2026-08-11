export type TransactionType = 'PAYMENT' | 'REFUND';
export type TransactionMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'UPI' | 'OTHER';

export interface Transaction {
  _id: string;
  organizationId: string;
  orderId: string;
  amount: number;
  type: TransactionType;
  method?: TransactionMethod;
  note?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  orderId: string;
  amount: number;
  type: TransactionType;
  method?: TransactionMethod;
  note?: string;
  idempotencyKey: string;
}

export interface CreateTransactionResult {
  transaction: Transaction;
  orderStatus: string;
}
