import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';
import BaseRouter from './routes';
import cors from 'cors';

const app = express();

// @ts-ignore
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') app.use(helmet());

app.use('/api', BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message, err);
  return res.status(BAD_REQUEST).json({
    error: err.message
  });
});


export default app;
