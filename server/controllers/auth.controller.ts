
import logger from '../utils/logger.js'
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { AuthenticatedRequest, RegisterDTO, LoginDTO } from '../types/auth.types.js';



export async function  registerUser(
    req: Request<{}, {}, RegisterDTO>,
    res: Response,
    next: NextFunction
): Promise<void> {
    
    try {
        const { name, email , password , role = 'user' } = req.body;
        if ( !name || !email || !password) {
            res.status(400).json({ message: "All fileds are required" });
            return 
        }

        const result = await authService.registerUser({ name, email, password, role });
        res.status(201).json(result);

    } catch (error) {
        logger.error('auth.controller.js -> registerUser -> Error during registration:', error);
        // Pass to Express global error handler
        next(error);
    }
}

export async function loginUser(
    req: Request<{}, {}, LoginDTO>, 
    res: Response,
    next: NextFunction
): Promise<void> {
    const { email, password } = req.body;
    try {
        logger.info("auth.controller.js -> Attempt login for:", {email});
        if ( !email || !password) {
            res.status(400).json({ message: "Email and Password are required" });
            return 
        }

        const result = await authService.loginUser({ email, password });
        res.status(200).json(result);
    } catch (error) {
        logger.error('Login error:', {email});
        // Pass to Express global error handler
        next(error);
    }
}

// Get current user for verification
export async function getCurrentUser(
    req: AuthenticatedRequest, 
    res: Response,
    next: NextFunction
): Promise<void> {

    try {
        if (!req.user || !req.user._id) {
            res.status(404).json({ error: 'Not authorized, token failed' });
            return 
        }

        const result = await authService.getUserById(req.user._id.toString());
        res.status(200).json(result);
    } catch (error) {
        logger.error('auth.controller.js -> getCurrentUser:', error);
        // Pass to Express global error handler
        next(error);
    }
}