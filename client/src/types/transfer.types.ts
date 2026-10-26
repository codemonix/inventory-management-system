import { UserRole } from "./auth.types";
import { IItem } from "./item.types";
import { ILocation } from "./location.types";

export type TransferStatus = 'in_transit' | 'confirmed' | 'cancelled';

// --- Finalized transfers (as returned by GET /transfers, references populated) ---

export interface ITransferLine {
    item: IItem | null;      // null if the item was deleted later
    quantity: number;
}

export interface ITransferUserRef {
    _id: string;
    email: string;
    role: UserRole;
}

export interface ITransfer {
    _id: string;
    fromLocation: ILocation | null;
    toLocation: ILocation | null;
    items: ITransferLine[];
    status: TransferStatus;
    createdBy?: ITransferUserRef | null;
    confirmedBy?: ITransferUserRef | null;
    confirmedAt?: string;
    cancelledBy?: ITransferUserRef | null;
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransferHistoryFilters {
    search?: string;
    status?: TransferStatus | 'all';
    fromLocation?: string;
    toLocation?: string;
    dateFrom?: string;   // YYYY-MM-DD
    dateTo?: string;     // YYYY-MM-DD
}

export interface TransferHistoryPage {
    transfers: ITransfer[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// --- Draft (temp) transfer: plain ids, not populated ---

export interface ITempTransferItem {
    itemId: string;
    quantity: number;
}

export interface ITempTransfer {
    _id?: string;
    fromLocation: string;
    toLocation: string;
    items: ITempTransferItem[];
}

// Network response DTOs
export interface TransferResponse {
    transfer: ITransfer;
    message?: string;
}

export interface TempTransferResponse {
    temp: ITempTransfer;
}

export interface TempTransferActionResponse {
    temp: ITempTransfer;
    message?: string;
}
