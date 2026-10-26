export type TransactionType = 'IN' | 'OUT' | 'TRANSFER';

// A stock movement as returned by GET /transactions/logs (references populated)
export interface ITransactionLog {
    _id: string;
    itemId: { _id: string; name: string } | null;
    userId: { _id: string; email: string } | null;
    locationId: { _id: string; name: string } | null;
    type: TransactionType;
    quantity: number;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export type TransactionSortField = 'createdAt' | 'type' | 'quantity';

// DTO for the network request parameters
export interface FetchLogsParams {
    search?: string;
    sortBy?: TransactionSortField;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
}

// DTO for the paginated network response
export interface PaginatedLogsResult {
    logs: ITransactionLog[];
    total: number;
}
