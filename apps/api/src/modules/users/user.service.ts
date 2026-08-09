import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AppError } from '../../lib/errors';
import { success } from '../../lib/response';
import { toSafeUser } from '../auth/auth.utils';
import {
    createUser as createUserRepo,
    findUserByEmail,
    findUserById,
    findUserByIdUnscoped,
    findUsersByOrganization,
    updateUserById,
    updateUserByIdUnscoped,
} from './user.repository';
import { sendEmail } from '../../lib/email';
import { findOrganizationById } from '../organizations/organization.repository';

const assertEmailIsFree = async (email: string, currentUserId: string) => {
    const existing = await findUserByEmail(email);
    if (existing && existing._id.toString() !== currentUserId) {
        throw new AppError('Email already in use', 409);
    }
};

export const getMe = async (userId: string) => {
    const user = await findUserByIdUnscoped(userId);
    if (!user) throw new AppError('User not found', 404);
    return success('User fetched successfully', toSafeUser(user));
};

export const updateMe = async (userId: string, updates: { name?: string; email?: string }) => {
    if (updates.email) await assertEmailIsFree(updates.email, userId);

    const user = await updateUserByIdUnscoped(userId, updates);
    if (!user) throw new AppError('User not found', 404);
    return success('Profile updated successfully', toSafeUser(user));
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await findUserByIdUnscoped(userId);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return success('Password changed successfully', null);
};

export const getUsers = async (
    organizationId: string,
    filters: { role?: 'ADMIN' | 'CUSTOMER'; page: number; limit: number }
) => {
    const { users, total } = await findUsersByOrganization(organizationId, filters);
    return success('Users fetched successfully', {
        users: users.map(toSafeUser),
        pagination: { page: filters.page, limit: filters.limit, total },
    });
};

export const getUser = async (organizationId: string, id: string) => {
    const user = await findUserById(id, organizationId);
    if (!user) throw new AppError('User not found', 404);
    return success('User fetched successfully', toSafeUser(user));
};

export const createUser = async (
    organizationId: string,
    input: { name: string; email: string; password: string; role: 'ADMIN' | 'CUSTOMER' }
) => {
    const existing = await findUserByEmail(input.email);
    if (existing) throw new AppError('Email already in use', 409);

    const organization = await findOrganizationById(organizationId);
    if (!organization) throw new AppError('Organization not found', 404);

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await createUserRepo({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        organizationId: new mongoose.Types.ObjectId(organizationId),
        isOrganizationConfigured: true,
    });

    if (input.role === 'ADMIN') {
        await sendEmail(
            input.email,
            `Welcome to ${organization.name}`,
            `<p>Hi ${input.name},</p>
            <p>${organization.name} has added you as an admin.</p>
            <p>You can log in with:</p>
            <p>Email: ${input.email}<br/>Password: ${input.password}</p>`
        );
    }

    return success('User created successfully', toSafeUser(user));
};

export const updateUser = async (
    organizationId: string,
    id: string,
    updates: { name?: string; email?: string; role?: 'ADMIN' | 'CUSTOMER' }
) => {
    if (updates.email) await assertEmailIsFree(updates.email, id);

    const user = await updateUserById(id, organizationId, updates);
    if (!user) throw new AppError('User not found', 404);
    return success('User updated successfully', toSafeUser(user));
};
