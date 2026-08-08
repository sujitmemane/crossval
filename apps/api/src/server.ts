import  express ,{ Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config(
    {
        path: '../.env',
    }
);

const app = express();


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

export default app;