import { Request, Response } from 'express';
import * as organizationService from './organization.service';

export const getMyOrganization = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await organizationService.getMyOrganization(organizationId);
    res.status(200).json(result);
};

export const updateMyOrganization = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await organizationService.updateMyOrganization(organizationId, req.body);
    res.status(200).json(result);
};
