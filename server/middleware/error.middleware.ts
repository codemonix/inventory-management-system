import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';
import { AppError } from '../errors/AppError.js';

// Every error response has the same shape: { success: false, message }
const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (res.headersSent) {
        logger.error(`[Error after response started] ${err?.message} - ${req.originalUrl}`);
        return;
    }

    if (err instanceof AppError && err.isOperational) {
        logger.warn(`[Client Error] ${err.statusCode} - ${err.message} - ${req.originalUrl}`);
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }

    if (err?.code === 11000) {
        const field = Object.keys(err.keyValue ?? err.keyPattern ?? {})[0] ?? 'field';
        logger.warn(`MongoDB Duplicate Key | ${req.originalUrl}`);
        res.status(409).json({
            success: false,
            message: `Duplicate value entered for ${field}. Please use another value.`,
        });
        return;
    }

    // Malformed ObjectIds and schema validation failures are client mistakes, not crashes
    if (err?.name === 'CastError') {
        res.status(400).json({ success: false, message: `Invalid value for ${err.path}` });
        return;
    }
    if (err?.name === 'ValidationError') {
        const message = Object.values(err.errors ?? {}).map((e: any) => e.message).join(' ') || err.message;
        res.status(400).json({ success: false, message });
        return;
    }
    if (err?.type === 'entity.parse.failed') {
        res.status(400).json({ success: false, message: 'Malformed JSON body' });
        return;
    }

    const statusCode = err?.statusCode || 500;
    const message = err?.message || 'Internal Server Error';

    // True Server Crashes (Programming/System Errors)
    logger.error(`[Unhandled Exception] ${message}`, {
        type: 'system_error',
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: err?.stack
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.status(statusCode).json({
        success: false,
        message: isProduction ? 'Something went wrong on the server.' : message,
        ...(isProduction ? {} : { stack: err?.stack }),
    });
};

export default errorHandler;
