import { Request, Response } from 'express';
import * as authService from './auth.service';
import { setAuthCookies, setAccessTokenCookie, clearAuthCookies } from './auth.utils';
import { AppError } from '../../lib/errors';

export const signup = async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    setAuthCookies(res, result.data);
    res.status(201).json(result);
};

export const signin = async (req: Request, res: Response) => {
    const result = await authService.signin(req.body);
    setAuthCookies(res, result.data);
    res.status(200).json(result);
};

export const refreshToken = async (req: Request, res: Response) => {
    const token = (req.cookies?.refreshToken as string | undefined) ?? req.body.refreshToken;
    if (!token) throw new AppError('Refresh token missing', 401);

    const result = await authService.refreshAccessToken(token);
    setAccessTokenCookie(res, result.data.accessToken);
    res.status(200).json(result);
};

export const verifyToken = async (req: Request, res: Response) => {
    const cookieToken = req.cookies?.accessToken as string | undefined;
    const token = cookieToken ?? req.headers.authorization?.split(' ')[1] ?? '';
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

export const signout = (_req: Request, res: Response) => {
    clearAuthCookies(res);
    res.status(200).json({ success: true, message: 'Signed out successfully', data: null });
};
