
import mongoose, { Schema } from "mongoose";
import { ITransferItem, ITransfer } from "../types/transfer.types.js";


const transferItemSchema = new Schema<ITransferItem>({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const transferSchema = new Schema<ITransfer>({
    fromLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
    toLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
    items: {
        type: [transferItemSchema],
        required: true,
        validate: [
            {
                validator: function (val: ITransferItem[]) {
                return Array.isArray(val) && val.length > 0;
                },
                message: 'Transfer package must include at least one item.'
            },
            {
                validator: function (val: ITransferItem[]) {
                    const itemIds = val.map( entry => {
                        return entry.item.toString();   
                    });
                    return new Set(itemIds).size === itemIds.length;
                },
                message: 'Duplicated items are not allowed in a transfer package'
            }

        ]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: [ 'assembling','in_transit', 'confirmed'],
        default: 'assembling'
    },
    confirmedAt: Date,
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<ITransfer>('Transfer', transferSchema);