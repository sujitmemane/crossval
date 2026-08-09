import { z } from 'zod';

export const createItemSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    quantity: z.number().min(0).default(0),
    rate: z.number().min(0),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
});

export const updateItemSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    rate: z.number().min(0).optional(),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
});

export const getItemsSchema = z.object({
    status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
