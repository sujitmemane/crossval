import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export const validate = (schema: ZodType, source: 'body' | 'query' | 'params' = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
        (req as unknown as Record<string, unknown>)[source] = schema.parse((req as unknown as Record<string, unknown>)[source]);
        next();
    };
