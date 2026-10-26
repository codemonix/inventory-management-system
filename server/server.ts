import 'dotenv/config';
import { Server } from 'http';
import app from './app.js';
import connectDB from './config/db.config.js';
import logger from './utils/logger.js';

let server: Server | undefined;

// Graceful shutdown: stop accepting new requests, finish current ones, then exit
const shutdown = (code: number) => {
    if (!server) process.exit(code);
    server.close(() => process.exit(code));
    setTimeout(() => process.exit(code), 10_000).unref();
};

// Registered before anything async so boot failures are logged too
process.on('uncaughtException', (err: Error) => {
    logger.error('❌ UNCAUGHT EXCEPTION! Shutting down safely...', { message: err.message, stack: err.stack });
    process.exit(1); 
});

process.on('unhandledRejection', (reason: unknown) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('❌ UNHANDLED REJECTION! Shutting down safely...', { message: err.message, stack: err.stack });
    shutdown(1);
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down.');
    shutdown(0);
});

if (!process.env.JWT_SECRET) {
    logger.error('❌ JWT_SECRET environment variable is missing. Halting system boot.');
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
    await connectDB();
    server = app.listen(PORT, () => {
        logger.info(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

startServer().catch((err: Error) => {
    logger.error(`❌ Server failed to start: ${err.message}`);
    process.exit(1);
});
