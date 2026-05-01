

// The core database model representation for a Transaction Log
export interface ITransactionLog {
    id: string;
    action: string;
    user?: string;
    details?: string | Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

// DTO for the network request parameters
export interface FetchLogsParams {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
}

// DTO for the paginated network response
export interface PaginatedLogsResult {
    logs: ITransactionLog[];
    totalCount: number;
}