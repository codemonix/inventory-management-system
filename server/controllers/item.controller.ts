
import { Request, Response, NextFunction } from 'express';
import * as ItemService from '../services/item.service.js';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest } from '../types/auth.types.js';


export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug('item.controller -> createItem req.body:', req.body);
    try {
        const { name, category, price } = req.body;

        if (!name) {
            throw new AppError('Name is required!', 400);
        }

        const savedItem = await ItemService.createItem({
            name,
            category,
            price,
            filename: req.file?.filename 
        });

        res.status(201).json({ success: true, message: 'Item created successfully', item: savedItem });
    } catch (error) {
        next(error);
    }
};

export const getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug("item.controller -> getItems -> req.query:", req.query);
    try {
        const result = await ItemService.getItems({
            page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
            search: req.query.search as string,
            sort: req.query.sort as string
        });

        logger.debug(`item.controller -> getItems -> page: ${req.query.page}, limit: ${req.query.limit}`);
        res.status(200).json({success: true, result});
    } catch (error) {
        next(error);
    }
};

export const getAllItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await ItemService.getAllItems();
        res.status(200).json({ items });
    } catch (error) {
        next(error);
    }
};

export const deleteItem = async (
    req:AuthenticatedRequest<{ id: string }>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await ItemService.deleteItem(id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateItemImage = async (req: AuthenticatedRequest<{ itemId: string }>, res: Response, next: NextFunction): Promise<void> => {
    logger.debug("item.controller -> updateItemImage -> ", req.file);
    try {
        const itemId = req.params.itemId as string;

        if (!req.file || !req.file.filename) {
            logger.warn("item.controller -> updateItemImage -> no file provided in the request");
            throw new AppError('No file provided', 400);
        }

        const updatedItem = await ItemService.updateItemImage(itemId, req.file.filename);

        res.status(200).json({ 
            success: true, 
            message: 'Item image updated successfully', 
            item: updatedItem 
        });
    } catch (error) {
        next(error);
    }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = req.params.itemId as string;
        if (!itemId) {
            logger.warn("item.controller -> updateItem -> no itemId provided in the request");
            throw new AppError('Item ID is required!', 400);
        }

        const { name, category, price } = req.body;

        if (!name) {
            throw new AppError('Name is required!', 400);
        }

        const updatedItem = await ItemService.updateItem(itemId, { name, category, price });

        res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        next(error);
    }
};

export const getItemImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filename = req.params.filename as string;
        const imagePath = path.join(process.cwd(), 'uploads', 'items', filename);
        
        if (!fs.existsSync(imagePath)) {
            throw new AppError('Image not found!', 404);
        }

        res.sendFile(imagePath);
    } catch (error) {
        next(error);
    }
};