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