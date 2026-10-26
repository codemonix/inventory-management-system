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
import { assertObjectId, parsePositiveInt, parseSort, searchRegex } from "../utils/validation.js";


const INVENTORY_SORT_FIELDS = ['name', 'code', 'totalStock'] as const;

export const createInventoryRecord = async (itemId: unknown, locationId: unknown, quantity: unknown) => {
    assertObjectId(itemId, 'item ID');
    assertObjectId(locationId, 'location ID');
    const qty = quantity === undefined || quantity === 0 || quantity === '0' ? 0 : parsePositiveInt(quantity);

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

    const newInventory = new Inventory({ itemId, locationId, quantity: qty });
    return await newInventory.save();
}

export const getPagedInventory = async (params: IGetInventoryParams) => {
    const page = Math.max(params.page || 1, 1);
    const limit = Math.min(Math.max(params.limit || 10, 1), 100);

    const sortStage = parseSort(params.sort, INVENTORY_SORT_FIELDS, { name: 1 });

    const matchPipeline: any[] = [
        { $lookup: { from: "items", localField: "itemId", foreignField: "_id", as: "item" } },
        { $unwind: "$item" }
    ];

    const nameRegex = searchRegex(params.search);
    if (nameRegex) {
        matchPipeline.push({ $match: { "item.name": nameRegex } });
    }

    // Count with the same filter as the page query, so totals reflect the search
    const countResult = await Inventory.aggregate([
        ...matchPipeline,
        { $group: { _id: "$itemId"} },
        { $count: "count" }
    ]);

    const totalCount = (countResult[0] && countResult[0].count) || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page > totalPages && totalPages > 0 ? totalPages : page;
    const skip = (currentPage - 1) * limit;

    const pipeline: any[] = [...matchPipeline];

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
        { $sort: { ...sortStage, itemId: 1 } },
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
    return await Inventory.aggregate(pipeline) as IAggregatedInventory[];
};

// Total quantity per item over all locations, only for the requested items.
// Items without stock are returned with 0 so the client never has to guess.
export const getStockTotals = async (itemIds: string[]): Promise<Record<string, number>> => {
    const totals: Record<string, number> = Object.fromEntries(itemIds.map(id => [id, 0]));
    if (itemIds.length === 0) return totals;

    const rows = await Inventory.aggregate<{ _id: mongoose.Types.ObjectId; total: number }>([
        { $match: { itemId: { $in: itemIds.map(id => new mongoose.Types.ObjectId(id)) } } },
        { $group: { _id: '$itemId', total: { $sum: '$quantity' } } },
    ]);
    for (const row of rows) totals[row._id.toString()] = row.total;
    return totals;
};

export const adjustInventory = async (params: IUpdateInventoryParams & { allowNegative?: boolean }) => {
    const { type, note, userId, allowNegative = false } = params;
    const itemId = assertObjectId(params.itemId, 'item ID');
    const locationId = assertObjectId(params.locationId, 'location ID');
    const qty = parsePositiveInt(params.quantity);

    const session = await mongoose.startSession();
    try {
        let updatedItem;
        await session.withTransaction(async () => {
            if (type === 'IN') {
                const [item, location] = await Promise.all([
                    Item.exists({ _id: itemId }).session(session),
                    Location.exists({ _id: locationId }).session(session),
                ]);
                if (!item || !location) {
                    throw new AppError('Item or Location not found.', 404);
                }
                // IN: upsert. If the shelf is new, create the record.
                updatedItem = await Inventory.findOneAndUpdate(
                    { itemId, locationId },
                    { $inc: { quantity: qty } },
                    { upsert: true, new: true, session }
                );
            } else {
                // OUT: cannot upsert. Unless negative stock is allowed, enforce it at the database level.
                const query: Record<string, unknown> = { itemId, locationId };
                if (!allowNegative) {
                    query.quantity = { $gte: qty }; 
                }

                updatedItem = await Inventory.findOneAndUpdate(
                    query,
                    { $inc: { quantity: -qty } },
                    { new: true, session }
                );

                // If updatedItem is null, we need to know the reason
                if (!updatedItem) {
                    const existingRecord = await Inventory.findOne({ itemId, locationId }).session(session);
                    if (!existingRecord) {
                        throw new AppError("Cannot remove stock: Item does not exist at this location.", 404);
                    }
                    throw new AppError(`Insufficient stock. Available: ${existingRecord.quantity}, Requested: ${qty}`, 400);
                }
            }

            // Stock change and its audit record commit together or not at all
            await logTransaction({ itemId, userId, locationId, type, quantity: qty, note }, session);
        });
        return updatedItem;
    } finally {
        await session.endSession();
    }
};
