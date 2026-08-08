import  express ,{ Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';
dotenv.config(
    {
        path: '../.env',
    }
);

const startServer = async () => {
    await connectDB();
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
};



startServer();