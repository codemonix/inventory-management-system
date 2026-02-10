
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';

import inventoryRoutes from './routes/inventory.routes.js';
import helmet from 'helmet';
import morgan from 'morgan';
import transferRoutes from './routes/transfer.routes.js';
import authRouts from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import locationRoutes from './routes/location.routes.js';
import userRoutes from './routes/user.routes.js';
import setupRoutes from './routes/setup.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import systemRoutes from './routes/system.routes.js'



const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

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


export default app;