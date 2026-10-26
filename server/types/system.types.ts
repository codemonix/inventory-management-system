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

// Single definition lives with the model's types
export type { ISystemSetting } from './systemSetting.type.js';

// --- TYPES ----
export interface IGetLogsParams {
    page?: number;
    limit?: number;
    level?: string;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
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
    search?: string;
}

export interface IUpdateSettingsBody {
    logLevel?: unknown;
    enableDbLogging?: unknown;
    demoMode?: unknown;
}

export interface IFactoryResetBody {
    confirmation: string;
}

export interface IClearDataBody {
    target: 'transfers' | 'items';
}

