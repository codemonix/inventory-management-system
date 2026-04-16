import { Response, NextFunction } from 'express';
import * as systemLogService from '../services/systemLog.service.js';
import logger from '../utils/logger.js';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { ILogQueryParams, IUpdateSettingsBody } from '../types/system.types.js';

export const getSystemLogs = async (
    req: AuthenticatedRequest<any, any, any, ILogQueryParams>, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '50');
        const { level, type } = req.query;

        const result = await systemLogService.getLogs({ page, limit, level, type });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const clearSystemLogs = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    try {
        await systemLogService.clearLogs();
        logger.info(`System logs manually cleared by ${req.user.email}`, { 
            type: 'audit', action: 'CLEAR_LOGS', userId: req.user._id 
        });
        res.status(200).json({ success: true, message: "System logs cleared successfully" });
    } catch (error) {
        next(error);
    }
}

export const getSystemSettings = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const settings = await systemLogService.getSettings();
        res.status(200).json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};

export const updateSystemSettings = async (
    req: AuthenticatedRequest<any, any, IUpdateSettingsBody>, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const { logLevel, enableDbLogging } = req.body;
        const settings = await systemLogService.updateSettings(logLevel, enableDbLogging);

        logger.info(`System settings updated by ${req.user.email}`, { 
            type: 'audit', action: 'UPDATE_SETTINGS', userId: req.user._id, newLevel: logLevel
        });

        res.status(200).json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};