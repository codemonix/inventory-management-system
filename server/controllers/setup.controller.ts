import { Request, Response, NextFunction } from 'express';
import * as setupService from '../services/setup.service.js';
import { AppError } from '../errors/AppError.js';
import { ICreateAdminBody, ISetupStatusResponse } from '../types/setup.types.js';


export const needSetup = async (
    req: Request, 
    res: Response<ISetupStatusResponse>, 
    next: NextFunction
): Promise<void> => {
    try {
        const shouldSetup = await setupService.checkSetupRequired();
        
        res.status(200).json({ 
            success: true,
            needSetup: shouldSetup 
        });
    } catch (error) {
        next(error);
    }
};


export const createFirstAdmin = async (
    req: Request<any, any, ICreateAdminBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { email, name, password } = req.body;

        // Validation gatekeeper
        if (!email || !name || !password) {
            return next(new AppError('Name, email, and password are required parameters.', 400));
        }

        // Hand off to the service
        await setupService.provisionFirstAdmin({ email, name, password });
        
        res.status(201).json({ 
            success: true,
            message: 'Admin user created successfully.' 
        });
    } catch (error) {
        next(error); 
    }
};