
import { Request, Response, NextFunction } from 'express';
import * as ItemService from '../services/item.service.js';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { assertObjectId, parseIdList, parsePagination } from '../utils/validation.js';

const IMAGE_DIR = path.join(process.cwd(), 'uploads', 'items');
const SAFE_IMAGE_NAME = /^[\w-]+\.(png|jpe?g|webp|gif)$/i;


export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug('item.controller -> createItem req.body:', req.body);
    try {
        const { name, category, price } = req.body;

        if (!name) {
            throw new AppError('Name is required!', 400);
        }

        const savedItem = await ItemService.createItem({ name, category, price });

        res.status(201).json({ success: true, message: 'Item created successfully', item: savedItem });
    } catch (error) {
        next(error);
    }
};

export const getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug("item.controller -> getItems -> req.query:", req.query);
    try {
        const { page, limit } = parsePagination(req.query.page, req.query.limit);
        const result = await ItemService.getItems({
            page,
            limit,
            search: req.query.search as string,
            sort: req.query.sort as string,
            ids: parseIdList(req.query.ids, 'ids'),
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
        const id = assertObjectId(req.params.id, 'item ID');
        await ItemService.deleteItem(id);
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateItemImage = async (req: AuthenticatedRequest<{ itemId: string }>, res: Response, next: NextFunction): Promise<void> => {
    logger.debug("item.controller -> updateItemImage -> ", req.file);
    try {
        const itemId = assertObjectId(req.params.itemId, 'item ID');

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
        const itemId = assertObjectId(req.params.itemId, 'item ID');

        const { name, category, price } = req.body;

        if (!name) {
            throw new AppError('Name is required!', 400);
        }

        const updatedItem = await ItemService.updateItem(itemId, { name, category, price });

        res.status(200).json({ success: true, message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        next(error);
    }
};

export const getItemImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Only plain filenames are accepted, so "../" (even URL-encoded) can never escape the folder
        const filename = path.basename(req.params.filename as string);
        if (!SAFE_IMAGE_NAME.test(filename)) {
            throw new AppError('Image not found!', 404);
        }
        const imagePath = path.join(IMAGE_DIR, filename);
        
        if (!fs.existsSync(imagePath)) {
            throw new AppError('Image not found!', 404);
        }

        res.sendFile(imagePath);
    } catch (error) {
        next(error);
    }
};