import { z } from 'zod';

export const createOrderSchema = z.object({
    userId: z.string().min(1),
    dueDate: z.coerce.date(),
    items: z
        .array(
            z.object({
                itemId: z.string().min(1),
                quantity: z.number().int().min(1),
            })
        )
        .min(1, 'Order must contain at least one item'),
});

export const updateOrderSchema = z.object({
    userId: z.string().min(1).optional(),
    dueDate: z.coerce.date().optional(),
    items: z
        .array(
            z.object({
                itemId: z.string().min(1),
                quantity: z.number().int().min(1),
            })
        )
        .min(1, 'Order must contain at least one item')
        .optional(),
});

export const getOrdersSchema = z.object({
    userId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const exportOrdersSchema = z
    .object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    })
    .refine((value) => value.startDate <= value.endDate, {
        message: 'startDate must be before or equal to endDate',
        path: ['startDate'],
    });
