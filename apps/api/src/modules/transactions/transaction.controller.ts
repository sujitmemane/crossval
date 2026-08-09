import { Request, Response } from 'express';
import * as transactionService from './transaction.service';

export const createTransaction = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const userId = req.user!.sub;
    const result = await transactionService.createTransaction(organizationId, userId, req.body);
    res.status(201).json(result);
};

export const getTransactions = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const orderId = req.query.orderId as string;
    const result = await transactionService.getAllTransactionOfOrder(organizationId, orderId);
    res.status(200).json(result);
};
