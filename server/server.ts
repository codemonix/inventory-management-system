import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.config.js';
import logger from './utils/logger.js';

// Exiting o unexpected fatal errors
process.on('uncaughtException', (err: Error) => {
    logger.error('❌ UNCAUGHT EXCEPTION! Shutting down safely...');
    logger.error(err.name, err.message);
    process.exit(1); 
});



const PORT: number = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        logger.info(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    })

    // Catch async errors
    process.on('unhandledRejection', (err: Error) => {
        logger.error('❌ UNHANDLED REJECTION! Shutting down safely...');
        logger.error(err.name, err.message);
        
        // Graceful shutdown: Stop accepting new requests, finish current ones, then exit
        server.close(() => {
            process.exit(1);
        });
    });
}

startServer();
