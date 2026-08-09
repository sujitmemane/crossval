import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AppError } from '../../lib/errors';
import { success } from '../../lib/response';
import { env } from '../../config/env';
import User from '../users/user.model';
import {
    generateAccessToken,
    generateRefreshToken,
    toSafeUser,
    verifyAccessToken as verifyAccessTokenUtil,
    verifyRefreshToken,
    TokenPayload,
} from './auth.utils';
import { findUserByEmail, createUser, findUserByResetPasswordToken } from '../users/user.repository';
import { createOrganization } from '../organizations/organization.repository';
import { sendEmail } from '../../lib/email';

const RESET_CODE_TTL_MS = 10 * 60 * 1000;

export const signup = async (input: {
    organizationName: string;
    country: string;
    currency: string;
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'CUSTOMER';
}) => {
    const { organizationName, country, currency, name, email, password, role } = input;
    const existing = await findUserByEmail(email);
    if (existing) throw new AppError('Email already in use', 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: hashedPassword, role });

    if (role === 'ADMIN') {
        const organization = await createOrganization({ name: organizationName, ownerId: user._id.toString(), country, currency });
        user.organizationId = organization._id;
        user.isOrganizationConfigured = true;
        await user.save();
    }

    const payload: TokenPayload = { sub: user._id.toString(), role: user.role, organizationId: user.organizationId?.toString() };
    return success('Account created successfully', {
        user: toSafeUser(user),
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    });
};

export const signin = async (input: { email: string; password: string }) => {
    const user = await User.findOne({ email: input.email });
    if (!user) throw new AppError('Invalid email or password', 401);

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const payload: TokenPayload = { sub: user._id.toString(), role: user.role, organizationId: user.organizationId?.toString() };
    return success('Signed in successfully', {
        user: toSafeUser(user),
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    });
};

export const refreshAccessToken = (token: string) => {
    try {
        const decoded = verifyRefreshToken(token);
        const accessToken = generateAccessToken({ sub: decoded.sub, role: decoded.role, organizationId: decoded.organizationId });
        return success('Access token refreshed', { accessToken });
    } catch {
        throw new AppError('Invalid or expired refresh token', 401);
    }
};

export const verifyAccessToken = (token: string) => {
    try {
        const payload = verifyAccessTokenUtil(token);
        return success('Token is valid', payload);
    } catch {
        throw new AppError('Invalid or expired token', 401);
    }
};

export const forgotPassword = async (email: string) => {

    const user = await findUserByEmail(email);
    if (!user) throw new AppError('User not found', 404);

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + RESET_CODE_TTL_MS);
    await user.save();

    const resetLink = `${env.frontendUrl}/reset-password?token=${token}`;
    await sendEmail(email, 'Reset Password', `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 10 minutes.</p>`);

    return success('If that email exists, a reset link has been sent', null);
};

export const resetPassword = async (input: { token: string; newPassword: string }) => {
    const user = await findUserByResetPasswordToken(input.token, new Date());
    if (!user) throw new AppError('Invalid or expired reset link', 400);

    user.password = await bcrypt.hash(input.newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return success('Password reset successful', null);
};
