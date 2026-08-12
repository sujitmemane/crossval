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

export const getOrderStats = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await orderService.getOrderStats(organizationId);
    res.status(200).json(result);
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

export const exportOrders = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const filename = `orders-${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Transfer-Encoding', 'chunked');
    res.status(200);

    await orderService.streamOrdersCsv(organizationId, startDate, endDate, (chunk) => {
        res.write(chunk);
    });

    res.end();
};
