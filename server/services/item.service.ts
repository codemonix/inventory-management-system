
import Item from "../models/item.model.js";
import Inventory from "../models/inventory.model.js";
import { AppError } from "../errors/AppError.js";
import { nanoid } from "nanoid";
import logger from "../utils/logger.js";
import path from 'path';
import fs from 'fs/promises';
import { CreateItemDTO, UpdateItemDTO, QueryItemsDTO } from "../types/item.types.js";

export const createItem = async (data: CreateItemDTO) => {
    const { name, category, price, filename } = data;
    
    const itemCode = nanoid(10);
    const imageUrl = filename ? `/uploads/items/${filename}` : '/uploads/items/default.jpg';
    const nameLower = name.toLowerCase();

    try {
        const newItem = new Item({
            name,
            nameLower,
            code: itemCode,
            category,
            price,
            imageUrl
        });
        
        return await newItem.save();
    } catch (error: any) {
        if (error.code === 11000 && error.keyPattern?.nameLower) {
            throw new AppError('Item with this name already exists (case-insensitive)', 400);
        }
        throw error;
    }
};

export const getItems = async (queryData: QueryItemsDTO) => {
    const page = Math.max(1, queryData.page || 1);
    const limit = Math.max(1, queryData.limit || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Sanitize search input for safe case-insensitive regex matching
    if (queryData.search) {
        const searchTrimmed = queryData.search.trim();
        const escapeRegex = (str: string) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        filter.name = { $regex: escapeRegex(searchTrimmed), $options: 'i' };
    }

    const sortOptions: any = {};
    if (queryData.sort) {
        const [sortField, sortDirection] = queryData.sort.split('_');
        sortOptions[sortField] = sortDirection === 'desc' ? -1 : 1;
    }

    const items = await Item.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

    const totalCount = await Item.countDocuments(filter);
    
    return { items, totalCount };
};

export const getAllItems = async () => {
    const items = await Item.find({}).sort({ createdAt: -1 }).lean();
    if (!items || items.length === 0) {
        throw new AppError('No items found', 404);
    }
    return items;
};

export const deleteItem = async (itemId: string) => {
    const isReferenced = await Inventory.exists({ itemId });
    if (isReferenced) {
        throw new AppError('Item is used in Inventory, cannot be deleted', 400);
    }

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
        throw new AppError('Item not found', 404);
    }
    
    return item;
};

export const updateItemImage = async (itemId: string, filename: string) => {
    const newImageUrl = `/uploads/items/${filename}`;
    
    // Find the item first to check its old image
    const itemToUpdate = await Item.findById(itemId);
    if (!itemToUpdate) {
        throw new AppError('Item not found', 404);
    }

    const oldImageUrl = itemToUpdate.imageUrl;
    itemToUpdate.imageUrl = newImageUrl;
    const updatedItem = await itemToUpdate.save();

    // Safely delete the old image if it's not the default
    if (oldImageUrl && !oldImageUrl.includes('default.jpg')) {
        try {
            const oldFilename = oldImageUrl.split('/').pop();
            if (oldFilename) {
                const oldPath = path.join(process.cwd(), 'uploads', 'items', oldFilename);
                await fs.unlink(oldPath);
                logger.debug(`Deleted old image: ${oldPath}`);
            }
        } catch (fsError: any) {
            logger.error(`Failed to delete old image for item ${itemId}: ${fsError.message}`);
            // We don't throw an error here because the DB update was successful.
        }
    }

    return updatedItem;
};

export const updateItem = async (itemId: string, data: UpdateItemDTO) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            itemId,
            data,
            { new: true, runValidators: true, context: 'query' }
        );

        if (!updatedItem) {
            throw new AppError('Item not found', 404);
        }

        return updatedItem;
    } catch (error: any) {
        if (error.code === 11000 && error.keyPattern?.nameLower) {
            throw new AppError('Another item already has this name (case-insensitive)', 400);
        }
        throw error;
    }
};