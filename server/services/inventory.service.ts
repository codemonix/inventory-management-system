import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import Item from "../models/item.model.js";
import Location from "../models/location.model.js";
import { logTransaction } from "./transaction.service.js";
import {
    IAggregatedInventory,
    IGetInventoryParams,
    IUpdateInventoryParams
} from "../types/inventory.types.js";
import { AppError } from "../errors/AppError.js";
import logger from "../utils/logger.js";


export const createInventoryRecord = async (itemId: string, locationId: string, quantity: number) => {
    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(locationId)) {
        throw new Error('INVALID_ID');
    }

    const [isExistItem, isExistLocation] = await Promise.all([
        Item.findById(itemId),
        Location.findById(locationId)
    ]);

    if (!isExistItem || !isExistLocation) {
        throw new AppError('Item or Location not found.', 404);
    }

    const existing = await Inventory.findOne({ itemId, locationId });
    if (existing) {
        throw new AppError('Inventory already exists for this item and location.', 409);
    }

    const newInventory = new Inventory({ itemId, locationId, quantity });
    return await newInventory.save();
}

export const getPagedInventory = async (params: IGetInventoryParams) => {
    const page = Math.max(params.page || 1, 1);
    const limit = Math.max(params.limit || 10, 1);

    let sortStage: Record<string, 1 | -1> = { "name": 1 };
    if (params.sort) {
        const [field, order] = params.sort.split('_');
        sortStage = { [field]: order === 'desc' ? -1 : 1 };
    }

    const countResult = await Inventory.aggregate([
        { $group: { _id: "$itemId"} },
        { $count: "count" }
    ]);

    const totalCount = (countResult[0] && countResult[0].count) || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page > totalPages && totalPages > 0 ? totalPages : page;
    const skip = (currentPage - 1) * limit;

    const pipeline: any[] = [
        { $lookup: { from: "items", localField: "itemId", foreignField: "_id", as: "item" } },
        { $unwind: "$item" }
    ];

    if (params.search) {
        const escapeRegex = (str: string) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        pipeline.push({
            $match: { "item.name": { $regex: escapeRegex(params.search), $options: 'i' } }
        });
    }

    pipeline.push(
        { $lookup: { from: "locations", localField: "locationId", foreignField: "_id", as: "location" } },
        { $unwind: "$location" },
        {
            $group: {
                _id: "$itemId",
                name: { $first: "$item.name" },
                code: { $first: "$item.code" },
                image: { $first: "$item.imageUrl" },
                stock: {
                    $push: {
                        locationId: "$location._id",
                        locationName: "$location.name",
                        quantity: "$quantity"
                    }
                },
                totalStock: { $sum: "$quantity" }
            }
        },
        {
            $project: {
                _id: 0,
                itemId: "$_id",
                code: 1,
                name: 1,
                image: 1,
                stock: 1,
                totalStock: 1
            }
        },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit }
    );

    const items = await Inventory.aggregate(pipeline) as IAggregatedInventory[];
    logger.debug(`inventory.Service -> params.page:${params.page}, page;${page}`)
    return {
        items,
        pagination: { totalCount, totalPages, currentPage, pageSize: limit }
    };
};

export const getAllInventory = async (): Promise<IAggregatedInventory[]> => {
    const pipeline: any[] = [
        { $lookup: { from: "items", localField: "itemId", foreignField: "_id", as: "item" } },
        { $unwind: "$item" },
        { $lookup: { from: "locations", localField: "locationId", foreignField: "_id", as: "location" } },
        { $unwind: "$location" },
        {
            $group: {
                _id: "$itemId",
                name: { $first: "$item.name" },
                code: { $first: "$item.code" },
                image: { $first: "$item.imageUrl" },
                stock: {
                    $push: {
                        locationId: "$location._id",
                        locationName: "$location.name",
                        quantity: "$quantity"
                    }
                },
                totalStock: { $sum: "$quantity" }
            }
        },
        {
            $project: {
                _id: 0,
                itemId: "$_id",
                code: 1,
                name: 1,
                image: 1,
                stock: 1,
                totalStock: 1
            }
        },
        { $sort: { name: 1 } }
    ];
    const dashboardInventory = await Inventory.aggregate(pipeline) as IAggregatedInventory[];
    
    return await Inventory.aggregate(pipeline) as IAggregatedInventory[];
};

export const adjustInventory = async (params: IUpdateInventoryParams & { allowNegative?: boolean }) => {
    const { itemId, locationId, quantity, type, note, userId, allowNegative = false } = params;
    const qty = Math.abs(quantity);

    let updatedItem;

    if (type === 'IN') {
        // IN: upsert, If the shelf is new, create the record.
        updatedItem = await Inventory.findOneAndUpdate(
            { itemId, locationId },
            { $inc: { quantity: qty } },
            { upsert: true, new: true }
        );
    } else {
        // OUT: CANNOT upsert. 
        const query: any = { itemId, locationId };

        // If negative stock is NOT allowed, strictly enforce it at the database level!
        if (!allowNegative) {
            query.quantity = { $gte: qty }; 
        }

        // IN: upsert. If the shelf is new, create the record.
        updatedItem = await Inventory.findOneAndUpdate(
            query,
            { $inc: { quantity: -qty } },
            { new: true } // Notice: upsert is completely removed here!
        );

        // If updatedItem is null, we need to know the reson
        if (!updatedItem) {
            const existingRecord = await Inventory.findOne({ itemId, locationId });
            
            if (!existingRecord) {
                throw new AppError("Cannot remove stock: Item does not exist at this location.", 404);
            } else {
                throw new AppError(`Insufficient stock. Available: ${existingRecord.quantity}, Requested: ${qty}`, 400);
            }
        }
    }

    // Log the transaction
    await logTransaction({
        itemId,
        userId,
        locationId,
        updatedItem,
        type,
        quantity: qty,
        note
    });

    return updatedItem;
};


export const removeInventoryRecord = async (id: string) => {
    const deletedItem = await Inventory.findByIdAndDelete(id);
    if (!deletedItem) throw new Error("NOT_FOUND");
    return deletedItem;
};

