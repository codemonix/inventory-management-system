import mongoose from 'mongoose';
import { ITempTransfer } from '../types/transfer.types.js';


const tempTransferSchema = new mongoose.Schema<ITempTransfer>({
    fromLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    items: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            quantity: { type: Number, required: true },
        },
    ],
}, { timestamps: true });

export default mongoose.model<ITempTransfer>('TempTransfer', tempTransferSchema);