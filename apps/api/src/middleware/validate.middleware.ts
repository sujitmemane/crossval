import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export const validate = (schema: ZodType, source: 'body' | 'query' | 'params' = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.parse((req as unknown as Record<string, unknown>)[source]);
        Object.defineProperty(req, source, {
            value: parsed,
            writable: true,
            configurable: true,
        });
        next();
    };
