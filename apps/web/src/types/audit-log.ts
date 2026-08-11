export type AuditAction =
  | 'ORDER_CREATED'
  | 'ORDER_ITEMS_UPDATED'
  | 'ORDER_DUE_DATE_UPDATED'
  | 'ORDER_CUSTOMER_REASSIGNED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_REFUNDED'
  | 'ORDER_PENDING'
  | 'ORDER_PARTIALLY_PAID'
  | 'ORDER_PAID'
  | 'ORDER_OVERDUE';

export interface AuditLog {
  _id: string;
  organizationId: string;
  userId: string;
  orderId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
