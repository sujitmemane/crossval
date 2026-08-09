import { z } from 'zod';

export const updateOrganizationSchema = z.object({
    name: z.string().min(2).optional(),
    country: z.string().length(2).transform((val) => val.toUpperCase()).optional(),
    currency: z.string().length(3).transform((val) => val.toUpperCase()).optional(),
});
