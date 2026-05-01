
import api, { isApiError } from "../api/api";
import { logDebug, logError, logInfo } from "../utils/logger";
import { 
    FetchSystemLogsParams, 
    PaginatedSystemLogs, 
    ClearLogsResponse 
} from "../types/systemLog.types";

export const fetchSystemLogs = async (params: FetchSystemLogsParams = {}): Promise<PaginatedSystemLogs> => {
    const {
        page = 1, 
        limit = 50, 
        level = 'all', 
        sortBy = 'timestamp', 
        sortOrder = 'desc' 
    } = params;

    try {
        const response = await api.get<PaginatedSystemLogs>(
            `/system/logs?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=${limit}&level=${level}`
        );
        logInfo("systemLogService -> fetchSystemLogs successful.");
        logDebug("systemLogService -> fetchSystemLogs -> logs length:", response.data.logs.length);
        return response.data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to fetch system logs API:", error.message);
            throw new Error(backendMessage || "Failed to fetch system logs.");
        }
        if (error instanceof Error) throw error;
        throw new Error("An unknown error occurred while fetching system logs.");
    }
};

export const clearSystemLogs = async (): Promise<ClearLogsResponse> => {
    try {
        const response = await api.delete<ClearLogsResponse>('/system/logs');
        logInfo("systemLogService -> clearSystemLogs successful.");
        return response.data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to clear system logs API:", error.message);
            throw new Error(backendMessage || "Failed to clear system logs.");
        }
        if (error instanceof Error) throw error;
        throw new Error("An unknown error occurred while clearing system logs.");
    }
};