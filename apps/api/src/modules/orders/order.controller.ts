import { Request, Response } from 'express';
import * as orderService from './order.service';

interface OrderQuery {
    userId?: string;
    page: number;
    limit: number;
}

export const createOrder = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await orderService.createOrder(organizationId, req.body);
    res.status(201).json(result);
};

export const getOrders = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const query = req.query as unknown as OrderQuery;
    const result = await orderService.getOrders(organizationId, query);
    res.status(200).json(result);
};

export const updateOrder = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const userId = req.user!.sub;
    const result = await orderService.updateOrder(organizationId, userId, req.params.id as string, req.body);
    res.status(200).json(result);
};
