import mongoose from "mongoose";


export interface IInventory extends mongoose.Document {
    itemId: mongoose.Types.ObjectId;
    locationId: mongoose.Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

// The shape of a single location's stock inside the aggregated result
export interface IInventoryStock {
    locationId: mongoose.Types.ObjectId;
    locationName: string;
    quantity: number;
}

// The shape of the complex aggregated inventory result
export interface IAggregatedInventory {
    itemId: mongoose.Types.ObjectId;
    name: string;
    image: string;
    stocks: IInventoryStock[];
    totalQuantity: number;
}

export interface IGetInventoryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
}

export interface IUpdateInventoryParams {
    itemId: string;
    locationId: string;
    userId: string | mongoose.Types.ObjectId;
    quantity: number;
    type: 'IN' | 'OUT' | 'TRANSFER';
    note?: string;
}