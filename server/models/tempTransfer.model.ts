import mongoose from 'mongoose';
import { ITempTransfer } from '../types/transfer.types.js';


// A user's draft transfer. Items added here are already deducted (reserved) from the source location.
const tempTransferSchema = new mongoose.Schema<ITempTransfer>({
    // Each user has at most one draft. Legacy drafts created before this field existed are
    // claimed by the first user who opens the transfer page (see transfer.service getTempTransfer).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    items: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
}, { timestamps: true });

tempTransferSchema.index({ createdBy: 1 }, { unique: true, partialFilterExpression: { createdBy: { $exists: true } } });

export default mongoose.model<ITempTransfer>('TempTransfer', tempTransferSchema);
