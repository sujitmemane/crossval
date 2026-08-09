import nodemailer from 'nodemailer';
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
    },
});

export const sendEmail = async (email: string, subject: string, html: string): Promise<boolean> => {
    try {
        await transporter.sendMail({
            from: env.smtpUser,
            to: email,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('Failed to send email', error);
        return false;
    }
};
