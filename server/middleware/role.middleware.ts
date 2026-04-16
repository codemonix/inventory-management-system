
import { Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { AppError } from "../errors/AppError.js";
import { AuthenticatedRequest, UserRole } from "../types/auth.types.js";



export function requiredRole(...allowedRoles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !req.user.role) {
            logger.error('role.middleware.ts -> requiredRole: req.user is undefined');
            return next(new AppError('Unauthorized', 401));
        }  

        if ( !allowedRoles.includes(req.user.role as UserRole)) {
            logger.warn("auth.controller.js -> requiredRole -> Access denied", req.user.email)
            return next(new AppError('Access denied, Insufficient permissions', 403));
        }
        next();
    };
}