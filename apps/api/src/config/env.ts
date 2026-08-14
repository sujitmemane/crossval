import dotenv from "dotenv";
dotenv.config();
export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    frontendUrl: process.env.FRONTEND_URL?.replace(/\/$/, ''),
};
