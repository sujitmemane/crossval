import { z } from 'zod';

export const createTransactionSchema = z.object({
    orderId: z.string().min(1),
    amount: z.number().positive(),
    type: z.enum(['PAYMENT', 'REFUND']),
    method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'OTHER']).optional(),
    note: z.string().optional(),
    idempotencyKey: z.string().min(1),
});

export const getTransactionsSchema = z.object({
    orderId: z.string().min(1),
});
