import { Request, Response } from 'express';
import * as itemService from './item.service';

interface ItemQuery {
    status?: 'AVAILABLE' | 'UNAVAILABLE';
    search?: string;
    page: number;
    limit: number;
}

export const createItem = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await itemService.createItem(organizationId, req.body);
    res.status(201).json(result);
};

export const getItems = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const query = req.query as unknown as ItemQuery;
    const result = await itemService.getItems(organizationId, query);
    res.status(200).json(result);
};

export const updateItem = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await itemService.updateItem(organizationId, req.params.id as string, req.body);
    res.status(200).json(result);
};
