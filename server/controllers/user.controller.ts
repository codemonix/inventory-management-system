import { Response, NextFunction } from 'express';
import logger from "../utils/logger.js";
import { AppError } from '../errors/AppError.js';
import { AuthenticatedRequest } from '../types/auth.types.js';
import * as userService from '../services/user.service.js'; // The Service Import
import { 
    IUserQuery, 
    IUpdateUserBody, 
    IToggleActiveBody, 
    IToggleApprovedBody 
} from '../types/user.types.js';

export const getUsers = async (
    req: AuthenticatedRequest<any, any, any, IUserQuery>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
        const search = req.query.search || '';
        const sortParam = req.query.sort || 'name_asc';

        const result = await userService.getUsers({ page, limit, search, sortParam });

        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error("user.controller -> Error in getUsers.")
        next(error);
    }
};

export const toggleUserActive = async (
    req: AuthenticatedRequest<{ id: string }, any, IToggleActiveBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            logger.warn("isActive boolean missing")
            throw new AppError("isActive boolean is required", 400);
        } 

        const user = await userService.toggleUserActive(id, isActive);
        
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (
    req: AuthenticatedRequest<{ id: string }, any, IUpdateUserBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, role, isActive, isApproved } = req.body;
        const user = await userService.updateUser(id, { name, email, role, isActive, isApproved });

        logger.info(`User updated: ${user.email}`);
        res.status(200).json({ success: true, user });
    } catch (error) {
        logger.error("user.controller -> Error in updateUser");
        next(error);
    }
};

export const toggleUserApproved = async (
    req: AuthenticatedRequest<{ id: string }, any, IToggleApprovedBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        if (isApproved === undefined) {
            logger.warn("isApproved boolean is required.")
            throw new AppError("isApproved boolean is required", 400);
        } 

        const user = await userService.toggleUserApproved(id, isApproved);

        logger.info(`User approved status updated: ${user.email}`);
        res.status(200).json({ success: true, user });
    } catch (error) {
        logger.error("user.controller -> Error in toggleUserApproved.")
        next(error);
    }
};