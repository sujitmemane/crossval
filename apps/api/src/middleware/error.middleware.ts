import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    console.error(err);

    if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        for (const issue of err.issues) {
            errors[issue.path.join('.') || 'value'] = issue.message;
        }
        res.status(400).json({ success: false, message: 'Validation failed', data: null, errors });
        return;
    }

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof Error ? err.message : 'Something went wrong';

    res.status(statusCode).json({
        success: false,
        message,
        data: null,
    });
};
