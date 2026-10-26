

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface ISystemLog {
    _id: string;
    level: string;
    message: string;
    meta?: {
        type?: string;
        [key: string]: unknown;
    };
    timestamp: string;
}

export interface PaginatedSystemLogs {
    logs: ISystemLog[];
    totalPages: number;
    currentPage: number;
    totalLogs: number;
}

export interface FetchSystemLogsParams {
    page?: number;
    limit?: number;
    level?: string;
    type?: string;
    search?: string;
    sortBy?: 'timestamp' | 'level' | 'message';
    sortOrder?: 'asc' | 'desc';
}

export interface ClearLogsResponse {
    message: string;
}