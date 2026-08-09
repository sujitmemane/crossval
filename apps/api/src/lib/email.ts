import { env } from "../config/env";
import { Resend } from "resend";



const resend = new Resend(env.resendApiKey as string);
export const sendEmail = async (email: string, subject: string, html: string): Promise<boolean> => {
    const { error } = await resend.emails.send({
        from: 'officialsujitmemane@gmail.com',
        to: email,
        subject,
        html,
    });

    if (error) {
        console.error('Failed to send email', error);
        return false;
    }

    return true;
};