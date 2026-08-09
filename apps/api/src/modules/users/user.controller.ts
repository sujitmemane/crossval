import { Request, Response } from 'express';
import * as userService from './user.service';

interface UserQuery {
    role?: 'ADMIN' | 'CUSTOMER';
    page: number;
    limit: number;
}

export const getMe = async (req: Request, res: Response) => {
    const result = await userService.getMe(req.user!.sub);
    res.status(200).json(result);
};

export const updateMe = async (req: Request, res: Response) => {
    const result = await userService.updateMe(req.user!.sub, req.body);
    res.status(200).json(result);
};

export const changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user!.sub, currentPassword, newPassword);
    res.status(200).json(result);
};

export const getUsers = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const query = req.query as unknown as UserQuery;
    const result = await userService.getUsers(organizationId, query);
    res.status(200).json(result);
};

export const getUser = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await userService.getUser(organizationId, req.params.id as string);
    res.status(200).json(result);
};

export const createUser = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await userService.createUser(organizationId, req.body);
    res.status(201).json(result);
};

export const updateUser = async (req: Request, res: Response) => {
    const organizationId = req.user!.organizationId!;
    const result = await userService.updateUser(organizationId, req.params.id as string, req.body);
    res.status(200).json(result);
};
