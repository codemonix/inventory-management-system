import Transaction from "../models/transaction.model.js";

export async function logTransaction(params) {
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

export async function getTransactionLogs({
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    skip = 0,
    limit = 20,
}) {
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

    const results = await query

    if (!search) {
        const total = await Transaction.countDocuments();
        return { logs: results, total };
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

    return { logs: filtered, total: filtered.length };
}

