import express ,{ Request, Response } from 'express';
import authRouter from './modules/auth/auth.routes';
import itemRouter from './modules/items/item.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response<{ message: string }>) => {
    res.status(200).json({ message: 'Hello World' });
});

app.use('/api/auth', authRouter);
app.use('/api/items', itemRouter);

app.use(errorHandler);

export default app;