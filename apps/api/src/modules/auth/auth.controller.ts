import { Request, Response } from 'express';
import * as authService from './auth.service';

export const signup = async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
};

export const signin = async (req: Request, res: Response) => {
    const result = await authService.signin(req.body);
    res.status(200).json(result);
};

export const refreshToken = async (req: Request, res: Response) => {
    const result = authService.refreshAccessToken(req.body.refreshToken);
    res.status(200).json(result);
};

export const verifyToken = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1] ?? '';
    const result = authService.verifyAccessToken(token);
    res.status(200).json(result);
};

export const forgotPassword = async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json(result);
};

export const resetPassword = async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(result);
};
