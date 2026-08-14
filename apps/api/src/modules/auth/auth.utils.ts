import jwt, { type SignOptions } from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import { env } from "../../config/env";
import { parseDurationMs } from "../../lib/duration";
import User from "../users/user.model";

export interface TokenPayload {
    sub: string;
    role: 'ADMIN' | 'CUSTOMER';
    organizationId?: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, env.accessTokenSecret as string, {
        expiresIn: env.accessTokenExpiresIn as SignOptions["expiresIn"],
    });
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.accessTokenSecret as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.refreshTokenSecret as string) as TokenPayload;
};

export const generateRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, env.refreshTokenSecret as string, {
        expiresIn: env.refreshTokenExpiresIn as SignOptions["expiresIn"],
    });
};


export const toSafeUser = (user: InstanceType<typeof User>) => {
    const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user.toObject();
    return safeUser;
};

const ACCESS_TOKEN_MAX_AGE_MS = parseDurationMs(env.accessTokenExpiresIn, 60 * 60 * 1000);
const REFRESH_TOKEN_MAX_AGE_MS = parseDurationMs(env.refreshTokenExpiresIn, 7 * 24 * 60 * 60 * 1000);

const isProd = env.nodeEnv === 'production';

const baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
};

export const setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
    res.cookie('accessToken', tokens.accessToken, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE_MS });
    res.cookie('refreshToken', tokens.refreshToken, { ...baseCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE_MS });
};

export const setAccessTokenCookie = (res: Response, accessToken: string) => {
    res.cookie('accessToken', accessToken, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE_MS });
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie('accessToken', baseCookieOptions);
    res.clearCookie('refreshToken', baseCookieOptions);
};