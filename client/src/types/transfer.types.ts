

export interface ITransferItem {
    item: string;
    quantity: number;
}

export interface ITransfer {
    _id?: string;
    fromLocation: string;
    toLocation: string;
    items: ITransferItem[];
    status?: 'pending' | 'approved' | 'cancelled' | 'in_transit';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITempTransfer {
    id?: string;
    fromLocation: string;
    toLocation: string;
    items: ITransferItem[];
}

// Network response DTOs
export interface GetTransfersResponse {
    transfer: ITransfer[];
}

export interface TransferResponse {
    transfer: ITransfer;
    message?: string;
}

export interface TempTransferResponse {
    temp: ITempTransfer;
}

// Generic Action response
export interface TempTransferActionResponse {
    tempTransfer: ITempTransfer;
    message?: string;
}

export interface DeleteResponse {
    message: string;
}