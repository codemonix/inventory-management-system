import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js'
import { DecodedToken } from '../types/auth.types.js';
import * as authService from '../services/auth.service.js'
import { AppError } from '../errors/AppError.js';
import { AuthenticatedRequest } from '../types/auth.types.js';


export default async function auth(
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void>{
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger.warn('auth.controller.js -> auth -> No token provided');
            return next(new AppError('Authentication Required, please log in.', 401))
        }
    
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        const user = await authService.getRawUserById(decoded.id);
        if (!user) {
            logger.warn('auth.controller.js -> auth -> User not found!');
            res.status(401).json({ code: 'USER_NOT_FOUND', error: 'User not found!'});
            return next(new AppError('User not found!', 401))
        }
        // Casting request
        (req as AuthenticatedRequest).user = user;
        // req.user = user;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            logger.warn('auth.middleware.js -> auth -> Token epxired at:', error.expiredAt);
            return next(new AppError('Your session has expired.', 401))
        }

        logger.error('auth.controller.js -> auth -> Invalid token:', error.message);
        res.status(401).json({ code: 'INVALID_TOKEN', error: 'Invalid token provided'});
        return 
    };
};

export const isAdmin = (
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    if (req.user?.role !== 'admin') {
        logger.warn('auth.controller.js -> isAdmin -> Admin access only!');
        res.status(403).json({ code: 'FORBIDDEN', error: 'Admin access only!'});
        return 
    } 
    next();
}

export const isManagerOrAdmin = (
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    if (req.user?.role === 'admin' || req.user?.role === 'manager' ) {
        next();
    } else {
        logger.warn('auth.controller.js -> isManagerOrAdmin -> Access denied!');
        res.status(403).json({ code: 'FORBIDDEN', error: 'Access denied!'});
        return 
    }
    
}