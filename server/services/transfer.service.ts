import mongoose, { ClientSession } from 'mongoose';
import Transfer from '../models/transfer.model.js';
import Inventory from '../models/inventory.model.js';
import Location from '../models/location.model.js';
import Item from '../models/item.model.js';
import User from '../models/users.model.js';
import TempTransfer from '../models/tempTransfer.model.js';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';
import { logTransaction } from './transaction.service.js';
import { assertObjectId, parsePagination, parsePositiveInt, searchRegex } from '../utils/validation.js';
import { ICreateTempTransferBody, IAddItemToTempBody, ICreateTransferBody } from '../types/transfer.types.js';

type StockLine = { itemId: mongoose.Types.ObjectId | string; quantity: number };

// Runs fn inside a MongoDB transaction (retried on transient errors) and always ends the session.
const runInTransaction = async <T>(fn: (session: ClientSession) => Promise<T>): Promise<T> => {
    const session = await mongoose.startSession();
    try {
        let result!: T;
        await session.withTransaction(async () => {
            result = await fn(session);
        });
        return result;
    } finally {
        await session.endSession();
    }
};

const assertDistinctExistingLocations = async (fromLocation: unknown, toLocation: unknown, session?: ClientSession) => {
    const from = assertObjectId(fromLocation, 'source location');
    const to = assertObjectId(toLocation, 'destination location');
    if (from === to) {
        throw new AppError('Source and destination must be different.', 400);
    }
    const count = await Location.countDocuments({ _id: { $in: [from, to] } }).session(session ?? null);
    if (count !== 2) {
        throw new AppError('Source or destination location not found.', 404);
    }
    return { from, to };
};

// Atomically deducts stock; fails if the location does not hold enough.
const deductStock = async (itemId: StockLine['itemId'], locationId: StockLine['itemId'], quantity: number, session: ClientSession) => {
    const updated = await Inventory.findOneAndUpdate(
        { itemId, locationId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true, session }
    );
    if (!updated) {
        logger.warn(`Insufficient stock for item ${itemId}`);
        throw new AppError(`Insufficient stock for item ${itemId}`, 422);
    }
};

const addStock = async (itemId: StockLine['itemId'], locationId: StockLine['itemId'], quantity: number, session: ClientSession) => {
    await Inventory.findOneAndUpdate(
        { itemId, locationId },
        { $inc: { quantity } },
        { upsert: true, new: true, session }
    );
};

// Returns the stock reserved by a draft back to its source location.
const releaseDraftStock = async (temp: InstanceType<typeof TempTransfer>, session: ClientSession) => {
    for (const line of temp.items) {
        await addStock(line.itemId, temp.fromLocation, line.quantity, session);
    }
};

const logTransferLines = async (
    lines: StockLine[],
    locationId: mongoose.Types.ObjectId | string,
    userId: string,
    note: string,
    session: ClientSession,
) => {
    for (const line of lines) {
        await logTransaction({ itemId: line.itemId, userId, locationId, type: 'TRANSFER', quantity: line.quantity, note }, session);
    }
};

export const getTempTransfer = async (userId: string) => {
    const own = await TempTransfer.findOne({ createdBy: userId });
    if (own) return own;
    // Claim a legacy draft created before drafts were per-user, so its reserved stock is not stranded
    return await TempTransfer.findOneAndUpdate(
        { createdBy: { $exists: false } },
        { $set: { createdBy: userId } },
        { new: true }
    );
};

export const createTempTransfer = async (data: ICreateTempTransferBody, userId: string) => {
    const { from, to } = await assertDistinctExistingLocations(data.fromLocation, data.toLocation);

    return await runInTransaction(async (session) => {
        // Starting a new draft replaces the old one: give its reserved stock back first
        const existing = await TempTransfer.findOne({ createdBy: userId }).session(session);
        if (existing) {
            await releaseDraftStock(existing, session);
            await existing.deleteOne({ session });
        }

        const [temp] = await TempTransfer.create([{
            createdBy: userId,
            fromLocation: from,
            toLocation: to,
            items: [],
        }], { session });
        return temp;
    });
};

export const addItemToTempTransfer = async (data: IAddItemToTempBody, userId: string) => {
    const itemId = assertObjectId(data.itemId, 'item ID');
    const quantity = parsePositiveInt(data.quantity);

    return await runInTransaction(async (session) => {
        const temp = await TempTransfer.findOne({ createdBy: userId }).session(session);
        if (!temp) throw new AppError('Temp transfer not found', 404);

        if (data.sourceLocationId !== undefined && temp.fromLocation.toString() !== data.sourceLocationId) {
            logger.warn("Item is from a different location than the transfer source");
            throw new AppError("Item is from a different location than the transfer source", 400);
        }

        // Reserve the stock at the source
        await deductStock(itemId, temp.fromLocation, quantity, session);

        const exist = temp.items.find(item => item.itemId.toString() === itemId);
        if (exist) {
            exist.quantity += quantity;
        } else {
            temp.items.push({ itemId, quantity });
        }

        await temp.save({ session });
        return temp;
    });
};

export const removeItemFromTempTransfer = async (itemId: string, userId: string) => {
    assertObjectId(itemId, 'item ID');

    return await runInTransaction(async (session) => {
        const temp = await TempTransfer.findOne({ createdBy: userId }).session(session);
        if (!temp) {
            logger.warn("Temp transfer not found");
            throw new AppError('Temp transfer not found', 404);
        }

        const itemToRemove = temp.items.find(i => i.itemId.toString() === itemId);
        if (!itemToRemove) {
            logger.warn("Item not found in temp transfer");
            throw new AppError('Item not found in temp transfer', 404);
        }

        // Upsert so the stock comes back even if the inventory row was removed meanwhile
        await addStock(itemToRemove.itemId, temp.fromLocation, itemToRemove.quantity, session);

        temp.items = temp.items.filter(item => item.itemId.toString() !== itemId);
        await temp.save({ session });
        return temp;
    });
};

// Throws the draft away and puts its reserved stock back on the source shelf.
export const discardTempTransfer = async (userId: string) => {
    return await runInTransaction(async (session) => {
        const temp = await TempTransfer.findOne({ createdBy: userId }).session(session);
        if (!temp) {
            throw new AppError('No draft transfer to discard', 404);
        }
        await releaseDraftStock(temp, session);
        await temp.deleteOne({ session });
    });
};

export const finalizeTempTransfer = async (userId: string) => {
    return await runInTransaction(async (session) => {
        const temp = await TempTransfer.findOne({ createdBy: userId }).session(session);
        if (!temp) {
            logger.warn("Temp transfer not found to finalize");
            throw new AppError('Nothing to finalize', 400);
        }
        if (temp.items.length === 0) {
            throw new AppError('Transfer package is empty.', 400);
        }

        const [newTransfer] = await Transfer.create([{
            fromLocation: temp.fromLocation,
            toLocation: temp.toLocation,
            items: temp.items.map(i => ({ item: i.itemId, quantity: i.quantity })),
            createdBy: userId,
            status: "in_transit"
        }], { session });

        // Stock was reserved while the draft was assembled; record it leaving the source now
        await logTransferLines(temp.items, temp.fromLocation, userId, `Transfer ${newTransfer._id} dispatched`, session);
        await temp.deleteOne({ session });
        return newTransfer;
    });
};

export const createDirectTransfer = async (data: ICreateTransferBody, userId: string) => {
    if (!Array.isArray(data.items) || data.items.length === 0) {
        logger.warn("Transfer package is empty");
        throw new AppError('Transfer package is empty.', 400);
    }
    const lines = data.items.map(line => ({
        itemId: assertObjectId(line?.item, 'item ID'),
        quantity: parsePositiveInt(line?.quantity),
    }));
    if (new Set(lines.map(l => l.itemId)).size !== lines.length) {
        throw new AppError('Duplicated items are not allowed in a transfer package', 400);
    }
    const { from, to } = await assertDistinctExistingLocations(data.fromLocation, data.toLocation);
    const itemCount = await Item.countDocuments({ _id: { $in: lines.map(l => l.itemId) } });
    if (itemCount !== lines.length) {
        throw new AppError('One or more items not found.', 404);
    }

    return await runInTransaction(async (session) => {
        for (const line of lines) {
            await deductStock(line.itemId, from, line.quantity, session);
        }

        const [transfer] = await Transfer.create([{
            fromLocation: from,
            toLocation: to,
            items: lines.map(l => ({ item: l.itemId, quantity: l.quantity })),
            createdBy: userId,
            status: 'in_transit',
        }], { session });

        await logTransferLines(lines, from, userId, `Transfer ${transfer._id} dispatched`, session);
        return transfer;
    });
};

export const confirmTransferReceived = async (transferId: string, userId: string) => {
    assertObjectId(transferId, 'transfer ID');

    return await runInTransaction(async (session) => {
        const transfer = await Transfer.findById(transferId).session(session);
        if (!transfer) {
            logger.warn("Transfer not found to confirm");
            throw new AppError('Transfer not found', 404);
        }

        if (transfer.status !== 'in_transit') {
            logger.warn("Transfer already completed or canceled");
            throw new AppError('Transfer already completed or canceled', 400);
        }

        const lines = transfer.items.map(({ item, quantity }) => ({ itemId: item, quantity }));
        for (const line of lines) {
            await addStock(line.itemId, transfer.toLocation, line.quantity, session);
        }

        transfer.status = 'confirmed';
        transfer.confirmedAt = new Date();
        transfer.confirmedBy = new mongoose.Types.ObjectId(userId);
        await transfer.save({ session });

        await logTransferLines(lines, transfer.toLocation, userId, `Transfer ${transfer._id} received`, session);
        return transfer;
    });
};

// Admin only: stops an in-transit transfer and returns its stock to the source location.
export const cancelTransfer = async (transferId: string, userId: string) => {
    assertObjectId(transferId, 'transfer ID');

    return await runInTransaction(async (session) => {
        const transfer = await Transfer.findById(transferId).session(session);
        if (!transfer) {
            throw new AppError('Transfer not found', 404);
        }
        if (transfer.status !== 'in_transit') {
            throw new AppError('Only in-transit transfers can be cancelled', 400);
        }

        const lines = transfer.items.map(({ item, quantity }) => ({ itemId: item, quantity }));
        for (const line of lines) {
            await addStock(line.itemId, transfer.fromLocation, line.quantity, session);
        }

        transfer.status = 'cancelled';
        transfer.cancelledAt = new Date();
        transfer.cancelledBy = new mongoose.Types.ObjectId(userId);
        await transfer.save({ session });

        await logTransferLines(lines, transfer.fromLocation, userId, `Transfer ${transfer._id} cancelled, stock returned`, session);
        return transfer;
    });
};

const TRANSFER_STATUSES = ['in_transit', 'confirmed', 'cancelled'] as const;

export interface ITransferHistoryQuery {
    page?: unknown;
    limit?: unknown;
    search?: unknown;
    status?: unknown;
    fromLocation?: unknown;
    toLocation?: unknown;
    dateFrom?: unknown;
    dateTo?: unknown;
}

const parseDate = (value: unknown, fieldName: string, endOfDay = false): Date | undefined => {
    if (value === undefined || value === '') return undefined;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) throw new AppError(`Invalid ${fieldName}`, 400);
    // A bare date (YYYY-MM-DD) as upper bound should include that whole day
    if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) date.setUTCHours(23, 59, 59, 999);
    return date;
};

// Paged transfer history, newest first, with optional filters and a free-text search over
// item names, location names and the creator's email.
export const getTransferHistory = async (query: ITransferHistoryQuery) => {
    const { page, limit } = parsePagination(query.page, query.limit, 20, 100);
    const filter: Record<string, unknown> = {};

    if (query.status !== undefined && query.status !== '' && query.status !== 'all') {
        if (!TRANSFER_STATUSES.includes(query.status as typeof TRANSFER_STATUSES[number])) {
            throw new AppError(`status must be one of: ${TRANSFER_STATUSES.join(', ')}`, 400);
        }
        filter.status = query.status;
    }
    if (query.fromLocation) filter.fromLocation = assertObjectId(query.fromLocation, 'source location');
    if (query.toLocation) filter.toLocation = assertObjectId(query.toLocation, 'destination location');

    const dateFrom = parseDate(query.dateFrom, 'dateFrom');
    const dateTo = parseDate(query.dateTo, 'dateTo', true);
    if (dateFrom || dateTo) {
        filter.createdAt = { ...(dateFrom && { $gte: dateFrom }), ...(dateTo && { $lte: dateTo }) };
    }

    const regex = searchRegex(query.search);
    if (regex) {
        const [locations, items, users] = await Promise.all([
            Location.find({ name: regex }).distinct('_id'),
            Item.find({ $or: [{ name: regex }, { code: regex }] }).distinct('_id'),
            User.find({ email: regex }).distinct('_id'),
        ]);
        filter.$or = [
            { fromLocation: { $in: locations } },
            { toLocation: { $in: locations } },
            { 'items.item': { $in: items } },
            { createdBy: { $in: users } },
        ];
    }

    const [transfers, total] = await Promise.all([
        Transfer.find(filter)
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('fromLocation')
            .populate('toLocation')
            .populate('items.item')
            .populate('createdBy', 'email role')
            .populate('confirmedBy', 'email role')
            .populate('cancelledBy', 'email role'),
        Transfer.countDocuments(filter),
    ]);

    return { transfers, total, page, limit, hasMore: page * limit < total };
};

// Admin "clear transfers": stock that is reserved in drafts or in transit goes back to its source first.
export const clearAllTransfers = async () => {
    await runInTransaction(async (session) => {
        const [drafts, inTransit] = await Promise.all([
            TempTransfer.find().session(session),
            Transfer.find({ status: 'in_transit' }).session(session),
        ]);
        for (const draft of drafts) {
            await releaseDraftStock(draft, session);
        }
        for (const transfer of inTransit) {
            for (const { item, quantity } of transfer.items) {
                await addStock(item, transfer.fromLocation, quantity, session);
            }
        }
        await Transfer.deleteMany({}, { session });
        await TempTransfer.deleteMany({}, { session });
    });
};
