import { z } from "zod";

export const signupSchema = z.object({
    organizationName: z.string().min(2),
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["ADMIN", "CUSTOMER"]),
});

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8),
});




