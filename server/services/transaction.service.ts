import Transaction from "../models/transaction.model.js";
import { ILogTransactionParams, 
    ITransaction, 
    ITransactionLogResult, 
    IGetTransactionLogsParams,
    IPopulatedTransaction
} from "../types/transactions.types.js";

export async function logTransaction(params: ILogTransactionParams): Promise<ITransaction> {
    const { itemId, userId, locationId, type, quantity, note } = params;
    return await Transaction.create({
        itemId,
        userId,
        locationId,
        type,
        quantity,
        note
    })
}

export async function getTransactionLogs(
    params: IGetTransactionLogsParams): Promise<ITransactionLogResult> {

    const search = params.search || '';
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    const skip = params.skip || 0;
    const limit = params.limit || 20;

    const regex  = new RegExp(search, 'i');
    // Base query: populate related documents
    const query = Transaction.find()
        .populate('itemId', 'name')
        .populate('userId', 'email')
        .populate('locationId', 'name')
        .sort({ [sortBy ]: sortOrder === 'asc' ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean();

    const results = await query as unknown as IPopulatedTransaction[];
    if (!search) {
        const total = await Transaction.countDocuments();
        return { logs: results , total };
    }
    
    // Apply filter if there is.
    const filtered = results.filter(tx => {
        return [
            tx.itemId?.name,
            tx.userId?.email,
            tx.locationId?.name,
            tx.note,
        ].some(field => field && regex.test(field));
    });
    return { logs: filtered , total: filtered.length };
}

