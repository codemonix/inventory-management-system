
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';

// Utils & Config
import errorHandler from './middleware/error.middleware.js';
import logger from './utils/logger.js';
import { AppError } from './errors/AppError.js';


// Routes
import inventoryRoutes from './routes/inventory.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import authRouts from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import locationRoutes from './routes/location.routes.js';
import userRoutes from './routes/user.routes.js';
import setupRoutes from './routes/setup.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import systemRoutes from './routes/system.routes.js';


const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';


const app = express();
app.use(cors());
app.use(express.json({ limit: '20kb' }));
app.use(helmet());
app.use(morgan(morganFormat, { stream: logger.stream}));

app.get('/', (req, res) => res.send("backend ok"));
app.use('/api/auth', authRouts);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/uploads', cors(), express.static(path.join(process.cwd(), '/uploads')));
app.use('/api/items', itemRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/system', systemRoutes )

app.all('*', (req: Request, res: Response, next: NextFunction): void => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;