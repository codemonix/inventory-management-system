import { ClientSession } from "mongoose";
import Transaction from "../models/transaction.model.js";
import Item from "../models/item.model.js";
import User from "../models/users.model.js";
import Location from "../models/location.model.js";
import { escapeRegex } from "../utils/validation.js";
import { ILogTransactionParams, 
    ITransaction, 
    ITransactionLogResult, 
    IGetTransactionLogsParams,
    IPopulatedTransaction
} from "../types/transactions.types.js";

const TRANSACTION_SORT_FIELDS = ['createdAt', 'type', 'quantity'];

export async function logTransaction(params: ILogTransactionParams, session?: ClientSession): Promise<ITransaction> {
    const { itemId, userId, locationId, type, quantity, note } = params;
    const [transaction] = await Transaction.create([{
        itemId,
        userId,
        locationId,
        type,
        quantity,
        note
    }], { session });
    return transaction;
}

export async function getTransactionLogs(
    params: IGetTransactionLogsParams): Promise<ITransactionLogResult> {

    const search = (params.search || '').trim().slice(0, 100);
    const sortBy = TRANSACTION_SORT_FIELDS.includes(params.sortBy || '') ? params.sortBy as string : 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
    const skip = Math.max(0, params.skip || 0);
    const limit = Math.min(200, Math.max(1, params.limit || 20));

    // Search runs in the database across the referenced names, so paging and totals stay correct.
    const filter: Record<string, unknown> = {};
    if (search) {
        const regex = { $regex: escapeRegex(search), $options: 'i' };
        const [items, users, locations] = await Promise.all([
            Item.find({ name: regex }).distinct('_id'),
            User.find({ email: regex }).distinct('_id'),
            Location.find({ name: regex }).distinct('_id'),
        ]);
        filter.$or = [
            { itemId: { $in: items } },
            { userId: { $in: users } },
            { locationId: { $in: locations } },
            { note: regex },
        ];
    }

    const [logs, total] = await Promise.all([
        Transaction.find(filter)
            .populate('itemId', 'name')
            .populate('userId', 'email')
            .populate('locationId', 'name')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean() as unknown as Promise<IPopulatedTransaction[]>,
        Transaction.countDocuments(filter),
    ]);

    return { logs, total };
}
