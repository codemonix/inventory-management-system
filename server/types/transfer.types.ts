import mongoose, { Document } from "mongoose";

export interface ITempTransfer extends Document {
    fromLocation: mongoose.Types.ObjectId;
    toLocation: mongoose.Types.ObjectId;
    items: {
        itemId: mongoose.Types.ObjectId | string;
        quantity: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ITransferItem {
    item: mongoose.Types.ObjectId;
    quantity: number;
}

export interface ITransfer extends Document {
    fromLocation: mongoose.Types.ObjectId;
    toLocation: mongoose.Types.ObjectId;
    items: ITransferItem[];
    createdBy: mongoose.Types.ObjectId;
    status: 'assembling' | 'in_transit' | 'confirmed';
    confirmedAt?: Date;
    confirmedBy?: mongoose.Types.ObjectId;
}

export interface ICreateTempTransferBody {
    fromLocation: string;
    toLocation: string;
}

export interface IAddItemToTempBody {
    itemId: string;
    quantity: number;
    sourceLocationId: string;
}

export interface ICreateTransferBody {
    fromLocation: string;
    toLocation: string;
    items: ITransferItem[];
}