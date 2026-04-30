import { Request, Response, NextFunction } from "express";
import Inventory from "../models/inventory.model.js";
import logger from '../utils/logger.js';
import * as inventoryService from '../services/inventory.service.js';
import { AuthenticatedRequest } from "../types/auth.types.js";
import { AppError } from "../errors/AppError.js";



export async function createInventory(
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { itemId , locationId, quantity } = req.body;
        const newInventory = await inventoryService.createInventoryRecord(itemId, locationId, quantity);

        res.status(201).json(newInventory);
        return;
    } catch (error) {
        next(error);
    }
};

export const getInventory = async (
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> => {
    logger.debug("inventory.controller -> getInventory -> req.query:", req.query);
    try {
        const result = await inventoryService.getPagedInventory({
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
            search: req.query.search as string,
            sort: req.query.sort as string,
        });
        res.status(200).json(result);
        return;
        } catch (error) {
        logger.error("inventory.controller -> getInventory -> error")
        next(error);
    };
};

export const getFullInventory = async (
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const fullInventory = await inventoryService.getAllInventory();
        res.json(fullInventory);
        return;
    } catch (error) {
        logger.error("inventory.controller -> getFullInventory  -> error:");
        next(error);
    }
}


// Update item

export const addStock = async (
    req: AuthenticatedRequest, 
    res: Response,
    next: NextFunction
): Promise<void> => {
    logger.debug("inventory.controller -> addStock -> req.body", req.body)
    try {
        const itemId = typeof req.params.itemId === 'string' ? req.params.itemId : undefined;
        const { locationId , quantity, note } = req.body;
        if (!itemId || !locationId || quantity === undefined) {
            logger.info("inventory.controller -> addStock -> Missing required fields");
            return next(new AppError("Missing required fields", 400));
        }
    
        const updatedInventory = await inventoryService.adjustInventory({
            itemId,
            locationId,
            quantity: Number(quantity),
            type: 'IN',
            note,
            userId: req.user?._id
        })

        res.json({ success: true, updatedInventory});
        return;
    } catch (error) {
        logger.error("inventory.controller -> addStock -> error")
        next(error);
    }
}

export const removeStock = async (
    req: AuthenticatedRequest, 
    res: Response,
    next: NextFunction
): Promise<void> => {

    try {
        const itemId = typeof req.params.itemId === 'string' ? req.params.itemId: undefined;
        const { locationId, quantity, note } = req.body;
        if (!itemId || !locationId || quantity === undefined) {
            logger.info("inventory.controller -> removeStock -> Missing required fields");
            return next(new AppError("Missing required fields", 400));
        }

        const updatedInventory = await inventoryService.adjustInventory({
            itemId,
            locationId,
            quantity: Number(quantity),
            type: 'OUT',
            note,
            userId: req.user?._id
        })
        res.json({ success: true, updatedInventory});
        return;
    } catch (error) {
        logger.error("inventory.controller -> removeStock -> error")
        next(error);
    }
}

export const deleteInventory = async (
    req: Request, 
    res: Response,
    next: NextFunction
) => {
    try {
        const itemToDelete = typeof req.params.id === 'string' ? req.params.id : undefined;
        if (!itemToDelete) {
            logger.info("inventory.controller -> deleteInventory -> Missing required fields");
            return next(new AppError("Missing required fields", 400));
        }
        const deleteItem = await Inventory.findByIdAndDelete(req.params.id);
        if (!deleteItem) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted"});
    } catch (error) {
        logger.error("inventory.controller -> deleteInventory -> error");
        next(error);
    }
};