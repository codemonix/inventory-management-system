import mongoose, { Document } from "mongoose";

export interface ITransaction extends Document {
    itemId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    locationId: mongoose.Types.ObjectId;
    type: 'IN' | 'OUT' | 'TRANSFER';
    quantity: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPopulatedTransaction extends Omit<ITransaction, 'itemId' | 'userId' | 'locationId'> {
    itemId: { _id: mongoose.Types.ObjectId, name: string } | null;
    userId: { _id: mongoose.Types.ObjectId, email: string } | null;
    locationId: { _id: mongoose.Types.ObjectId, name: string } | null;
}

export interface ILogTransactionParams {
    itemId: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    locationId: mongoose.Types.ObjectId | string;
    updatedItem?: any; 
    type: 'IN' | 'OUT' | 'TRANSFER';
    quantity: number;
    note?: string;
    
}

export interface IGetTransactionLogsParams {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | string;
    skip?: number;
    limit?: number;
}

export interface ITransactionLogResult {
    logs: IPopulatedTransaction[];
    total: number;
}

// HTTP Transaction query interface for transaction controller expected from the frontend
export interface ITransactionQuery {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | string; 
    skip?: string;
    limit?: string;
    page?: string;
}