import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js'
import { DecodedToken, UserRole } from '../types/auth.types.js';
import * as authService from '../services/auth.service.js'
import { AppError } from '../errors/AppError.js';
import { AuthenticatedRequest } from '../types/auth.types.js';


export default async function auth(
    req: Request, 
    _res: Response, 
    next: NextFunction
): Promise<void>{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('auth.middleware -> auth -> No token provided');
        return next(new AppError('Authentication Required, please log in.', 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logger.error('auth.middleware -> JWT_SECRET is not configured');
        return next(new AppError('Server configuration error.', 500));
    }

    let decoded: DecodedToken;
    try {
        decoded = jwt.verify(authHeader.slice(7), secret) as DecodedToken;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            logger.warn('auth.middleware -> auth -> Token expired at:', error.expiredAt);
            return next(new AppError('Your session has expired.', 401));
        }
        logger.warn('auth.middleware -> auth -> Invalid token:', error.message);
        return next(new AppError('Invalid token provided', 401));
    }

    try {
        const user = await authService.getRawUserById(decoded.id);
        if (!user) {
            logger.warn('auth.middleware -> auth -> User not found!');
            return next(new AppError('User not found!', 401));
        }
        // Deactivated or not-yet-approved accounts lose access immediately, even with a valid token.
        if (!user.isActive || !user.isApproved) {
            logger.warn(`auth.middleware -> auth -> Blocked inactive/unapproved user: ${user.email}`);
            return next(new AppError('Your account is inactive or not approved.', 401));
        }
        (req as AuthenticatedRequest).user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export const requireRole = (...allowedRoles: UserRole[]) => (
    req: Request, 
    _res: Response, 
    next: NextFunction
): void => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
        logger.warn(`auth.middleware -> requireRole -> Access denied (needs ${allowedRoles.join('/')})`);
        return next(new AppError('Access denied, insufficient permissions', 403));
    }
    next();
};

export const isAdmin = requireRole('admin');
export const isManagerOrAdmin = requireRole('admin', 'manager');
