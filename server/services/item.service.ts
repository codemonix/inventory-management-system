
import Item from "../models/item.model.js";
import Inventory from "../models/inventory.model.js";
import Transfer from "../models/transfer.model.js";
import TempTransfer from "../models/tempTransfer.model.js";
import { AppError } from "../errors/AppError.js";
import { nanoid } from "nanoid";
import logger from "../utils/logger.js";
import path from 'path';
import fs from 'fs/promises';
import { CreateItemDTO, UpdateItemDTO, QueryItemsDTO } from "../types/item.types.js";
import { parseSort, searchRegex } from "../utils/validation.js";

const ITEM_SORT_FIELDS = ['name', 'code', 'category', 'price', 'createdAt', 'updatedAt'] as const;

// Deletes an item's image from disk unless it is the shared default. Never throws:
// the DB change already succeeded, a leftover file is only logged.
const removeImageFile = async (imageUrl: string | undefined, itemId: string) => {
    if (!imageUrl || imageUrl.includes('default.jpg')) return;
    const filename = path.basename(imageUrl);
    try {
        const filePath = path.join(process.cwd(), 'uploads', 'items', filename);
        await fs.unlink(filePath);
        logger.debug(`Deleted image: ${filePath}`);
    } catch (fsError: any) {
        logger.error(`Failed to delete image for item ${itemId}: ${fsError.message}`);
    }
};

export const createItem = async (data: CreateItemDTO) => {
    const { name, category, price } = data;
    
    const itemCode = nanoid(10);
    const imageUrl = '/uploads/items/default.jpg';
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

    const filter: Record<string, unknown> = {};
    const nameRegex = searchRegex(queryData.search);
    if (nameRegex) filter.name = nameRegex;
    if (queryData.ids?.length) filter._id = { $in: queryData.ids };

    const sortOptions = parseSort(queryData.sort, ITEM_SORT_FIELDS, { createdAt: -1 });

    const items = await Item.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

    const totalCount = await Item.countDocuments(filter);
    
    return { items, totalCount };
};

export const getAllItems = async () => {
    return await Item.find({}).sort({ createdAt: -1 }).lean();
};

export const deleteItem = async (itemId: string) => {
    const isReferenced = await Inventory.exists({ itemId });
    if (isReferenced) {
        throw new AppError('Item is used in Inventory, cannot be deleted', 400);
    }
    const inTransfer = await Transfer.exists({ 'items.item': itemId, status: 'in_transit' })
        || await TempTransfer.exists({ 'items.itemId': itemId });
    if (inTransfer) {
        throw new AppError('Item is part of an open transfer, cannot be deleted', 400);
    }

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
        throw new AppError('Item not found', 404);
    }

    await removeImageFile(item.imageUrl, itemId);
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

    await removeImageFile(oldImageUrl, itemId);
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