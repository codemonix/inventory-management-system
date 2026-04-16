import mongoose, {Schema} from "mongoose";
import { ITransaction } from "../types/transactions.types.js";


const transactionSchema = new Schema<ITransaction>({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    type: { type: String, enum: [ 'IN', 'OUT', 'TRANSFER'], required: true },
    quantity: { type: Number, required: true },
    note: { type: String },
}, {timestamps: true})


const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;