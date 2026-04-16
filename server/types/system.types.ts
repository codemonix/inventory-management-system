import { Document} from "mongoose";

// --- DATABASE MODELS ----
export interface ISystemLog extends Document {
    level: string;
    message: string;
    meta?: {
        type?: string;
        [key: string]: any;
    };
    timestamp: Date;
}

export interface ISystemSetting extends Document {
    _id: string;
    logLevel: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
    enableDbLogging: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// --- TYPES ----
export interface IGetLogsParams {
    page?: number;
    limit?: number;
    level?: string;
    type?: string;
}

export interface IGetLogsResult {
    logs: ISystemLog[];
    totalPages: number;
    currentPage: number;
    totalLogs: number;
}

export interface ILogQueryParams {
    page?: string;
    limit?: string;
    level?: string;
    type?: string;
}

export interface IUpdateSettingsBody {
    logLevel: string;
    enableDbLogging: boolean;
}

export interface IFactoryResetBody {
    confirmation: string;
}

export interface IClearDataBody {
    target: 'transfers' | 'items';
}

