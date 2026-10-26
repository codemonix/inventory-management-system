import api, { isApiError } from "../api/api";
import { getBackendMessage } from "../utils/backendMessage";
import { logInfo, logError } from "../utils/logger";
import { FetchLogsParams, PaginatedLogsResult } from "../types/transaction.types";

export const fetchTransactionLogs = async (params: FetchLogsParams = {}): Promise<PaginatedLogsResult> => {
    const { 
        search = '', 
        sortBy = 'createdAt', 
        sortOrder = 'desc', 
        skip = 0, 
        limit = 20 
    } = params;

    try {
        const response = await api.get<PaginatedLogsResult>('/transactions/logs', {
            params: { search, sortBy, sortOrder, skip, limit },
        });
        logInfo('transactionService -> Get logs:', response.data);
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
            logError("Failed to fetch logs API:", error.message);
            throw new Error(backendMessage || "Failed to fetch transaction logs.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in getLogs:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while fetching logs.");
    }
}