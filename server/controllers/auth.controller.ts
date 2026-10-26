
import logger from '../utils/logger.js'
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { AuthenticatedRequest, RegisterDTO, LoginDTO } from '../types/auth.types.js';
import { AppError } from '../errors/AppError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



export async function  registerUser(
    req: Request<Record<string, never>, unknown, RegisterDTO>,
    res: Response,
    next: NextFunction
): Promise<void> {
    
    try {
        const { name, email , password } = req.body;
        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string'
            || !name.trim() || !email || !password) {
            return next(new AppError("All fields are required", 400));
        }
        if (!EMAIL_PATTERN.test(email)) {
            return next(new AppError("Invalid email address", 400));
        }
        if (password.length < 8) {
            return next(new AppError("Password must be at least 8 characters", 400));
        }

        const result = await authService.registerUser({ name: name.trim(), email, password });
        res.status(201).json(result);

    } catch (error) {
        logger.error('auth.controller.js -> registerUser -> Error during registration:', error);
        // Pass to Express global error handler
        next(error);
    }
}

export async function loginUser(
    req: Request<Record<string, never>, unknown, LoginDTO>, 
    res: Response,
    next: NextFunction
): Promise<void> {
    const { email, password } = req.body;
    try {
        logger.info("auth.controller.js -> Attempt login for:", {email});
        if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
            return next(new AppError("Email and Password are required", 400));
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
            return next(new AppError('Not authorized, token failed', 401));
        }

        const result = await authService.getUserById(req.user._id.toString());
        res.status(200).json(result);
    } catch (error) {
        logger.error('auth.controller.js -> getCurrentUser:', error);
        // Pass to Express global error handler
        next(error);
    }
}