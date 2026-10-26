import { Request, Response, NextFunction } from "express";
import Inventory from "../models/inventory.model.js";
import logger from '../utils/logger.js';
import * as inventoryService from '../services/inventory.service.js';
import { AuthenticatedRequest } from "../types/auth.types.js";
import { AppError } from "../errors/AppError.js";
import { assertObjectId, parseIdList, parsePagination } from "../utils/validation.js";



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
        const { page, limit } = parsePagination(req.query.page, req.query.limit);
        const result = await inventoryService.getPagedInventory({
            page,
            limit,
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

export const getStockTotals = async (
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const itemIds = parseIdList(req.query.itemIds, 'itemIds');
        const totals = await inventoryService.getStockTotals(itemIds);
        res.status(200).json({ success: true, totals });
    } catch (error) {
        next(error);
    }
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
            quantity,
            type: 'IN',
            note: typeof note === 'string' ? note.slice(0, 500) : undefined,
            userId: req.user._id
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
            quantity,
            type: 'OUT',
            note: typeof note === 'string' ? note.slice(0, 500) : undefined,
            userId: req.user._id
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
        const id = assertObjectId(req.params.id, 'inventory ID');
        const record = await Inventory.findById(id);
        if (!record) return next(new AppError("Inventory record not found", 404));
        if (record.quantity !== 0) {
            return next(new AppError("Only empty inventory records can be deleted. Remove the stock first.", 400));
        }
        await record.deleteOne();
        res.json({ success: true, message: "Inventory record deleted"});
    } catch (error) {
        logger.error("inventory.controller -> deleteInventory -> error");
        next(error);
    }
};