
import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

// Utils & Config
import errorHandler from './middleware/error.middleware.js';
import logger from './utils/logger.js';
import { AppError } from './errors/AppError.js';


// Routes
import inventoryRoutes from './routes/inventory.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import locationRoutes from './routes/location.routes.js';
import userRoutes from './routes/user.routes.js';
import setupRoutes from './routes/setup.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import systemRoutes from './routes/system.routes.js';


const isProduction = process.env.NODE_ENV === 'production';
const morganFormat = isProduction ? 'combined' : 'dev';

// CORS_ORIGIN is a comma-separated allow-list. Without it, production only serves same-origin
// requests (the frontend is proxied under the same domain) and development allows any origin.
const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean);
const corsOptions: CorsOptions = {
    origin: corsOrigins?.length ? corsOrigins : !isProduction,
};



const app = express();
// Running behind nginx: trust the first proxy so req.ip (used by the rate limiter) is the client IP.
app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json({ limit: '20kb' }));
app.use(helmet());
app.use(morgan(morganFormat, { stream: logger.stream}));

app.get('/', (req, res) => res.send("backend ok"));
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfers', transferRoutes);
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