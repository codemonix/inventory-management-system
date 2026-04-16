import { Response, NextFunction } from 'express';
import * as transferService from '../services/transfer.service.js';
import { AuthenticatedRequest } from '../types/auth.types.js';
import logger from '../utils/logger.js';
import { AppError } from '../errors/AppError.js';
import { 
    ICreateTempTransferBody, 
    IAddItemToTempBody, 
    ICreateTransferBody 
} from '../types/transfer.types.js';

export const getTempTransfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const temp = await transferService.getTempTransfer();
        logger.debug("Temp transfer:", temp);
        res.status(200).json({ success: true, temp });
    } catch (error) {
        logger.error("transfercontroller -> Error in getTempTransfer");
        next(error);
    }
};

export const createTempTransfer = async (
    req: AuthenticatedRequest<any, any, ICreateTempTransferBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const temp = await transferService.createTempTransfer(req.body);
        res.status(201).json({ success: true, temp });
    } catch (error) {
        logger.error("transfercontroller -> Error in createTempTransfer");
        next(error);
    }
};

export const addItemToTempTransfer = async (
    req: AuthenticatedRequest<any, any, IAddItemToTempBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const temp = await transferService.addItemToTempTransfer(req.body);
        res.status(201).json({ success: true, temp });
    } catch (error) {
        logger.error("transfercontroller -> Error in addItemToTempTransfer");
        next(error);
    }
};

export const removeItemFromTempTransfer = async (
    req: AuthenticatedRequest<{ itemId: string }>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { itemId } = req.params;
        if (!itemId) throw new AppError("Item ID is required", 400);

        const temp = await transferService.removeItemFromTempTransfer(itemId);
        res.status(200).json({ success: true, temp });
    } catch (error) {
        logger.error("transfercontroller -> Error in removeItemFromTempTransfer");
        next(error);
    }
};

export const finalizeTempTransfer = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const newTransfer = await transferService.finalizeTempTransfer(req.user._id.toString());
        res.status(201).json({ success: true, transfer: newTransfer });
    } catch (error) {
        logger.error("transfercontroller -> Error in finalizeTempTransfer")
        next(error);
    }
};

export const createTransfer = async (
    req: AuthenticatedRequest<any, any, ICreateTransferBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const transfer = await transferService.createDirectTransfer(req.body, req.user._id.toString());
        res.status(201).json({ success: true, message: 'Transfer initiated successfully.', transfer });
    } catch (error) {
        logger.error("transferController -> Error in createTransfer ")
        next(error);
    }
};

export const confirmTransfer = async (
    req: AuthenticatedRequest<{ id: string }>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            logger.warn("Transfer ID is required");
            throw new AppError("Transfer ID is required", 400);
        } 

        const transfer = await transferService.confirmTransferReceived(id);
        logger.info(`Transfer confirmed by user: ${req.user.email}`);
        
        res.status(200).json({ success: true, message: 'Transfer received and stock updated', transfer });
    } catch (error) {
        logger.error("transferController -> Error in confirmTransfer");
        next(error);
    }
};

export const getAllTransfers = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const transfers = await transferService.getAllTransfers();
        res.status(200).json({ success: true, transfers });
    } catch (error) {
        logger.error("transferController -> Error in getAllTransfers");
        next(error);
    }
};