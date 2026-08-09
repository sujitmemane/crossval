import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import User from "../users/user.model";

export interface TokenPayload {
    sub: string;
    role: 'ADMIN' | 'CUSTOMER';
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