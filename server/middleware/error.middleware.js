import logger from '../utils/logger.js';

const errorHandler = (error, req, res, next) => { // eslint-disable-line
    // Determine the status code
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
    
    // Log the full error to Winston/MongoDB
    logger.error(`[Unhandled Exception] ${error.message}`, { 
        type: 'system_error',
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: error.stack // Save the stack trace to the DB for debugging
    });

    // Send the sanitized response to the client
    res.status(statusCode).json({
        message: error.message,
        // Only expose the stack trace to the frontend in development mode
        stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
};

export default errorHandler;