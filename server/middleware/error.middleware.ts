import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';
import { AppError } from '../errors/AppError.js';

const errorHandler = (
    err: any, 
    req: Request, 
    res: Response, 
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Extract the status code from AppError, or default to 500
    
    if (err instanceof AppError && err.isOperational) {
        logger.warn(`[Client Error] ${statusCode} - ${message} - ${req.originalUrl}`);
        
        res.status(statusCode).json({
            success: false,
            message: message
        });
        return; 
    }
    
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value entered for ${field}. Please use another value.`;
        logger.warn(`MongoDB Duplicate Key | ${req.originalUrl}`);
        res.status(400).json({ success: false, error: message });
        return;
    }
    
    // True Server Crashes (Programming/System Errors)
    logger.error(`[Unhandled Exception] ${message}`, { 
        type: 'system_error',
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: err.stack 
    });

    // Send a generic message to the user 
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong on the server.' 
            : err.message, // Show the real error in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

export default errorHandler;