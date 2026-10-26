import api, { isApiError} from "../api/api";
import { getBackendMessage } from "../utils/backendMessage";
import { logDebug, logError, logInfo } from "../utils/logger";
import {
    FetchInventoryParams,
    InventoryPaginatedResult,
    StockTransactionResponse
} from "../types/inventory.types";


export const fetchInventory = async (params: FetchInventoryParams = {}): Promise<InventoryPaginatedResult> => {
    const { page = 1, limit = 10, sort = 'name', search } = params;
    logInfo("page, limit, sort, search:", page, limit, sort, search);
    try {
        // axios encodes params and drops empty ones (no more "search=null")
        const res = await api.get<InventoryPaginatedResult>('/inventory', { params: { page, limit, sort, search: search || undefined } });
        logDebug("InventoryServices -> fetchInventory:", res.data);
        return res.data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
            logError("Failed to fetch inventory API:", error.message);
            throw new Error(backendMessage || "Failed to fetch inventory.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in fetchInventory:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while fetching inventory.");
    }
};

// Total stock per item (all locations) for just these items
export const fetchStockTotals = async (itemIds: string[]): Promise<Record<string, number>> => {
    if (itemIds.length === 0) return {};
    try {
        const res = await api.get<{ totals: Record<string, number> }>('/inventory/totals', {
            params: { itemIds: itemIds.join(',') },
        });
        return res.data.totals;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
            logError("Failed to fetch stock totals API:", error.message);
            throw new Error(backendMessage || "Failed to fetch stock totals.");
        }
        throw error instanceof Error ? error : new Error("An unknown error occurred while fetching stock totals.");
    }
};

export const stockIn = async (itemId: string, locationId: string, quantity: number ): Promise<StockTransactionResponse> => {
    try {
        const res = await api.post<StockTransactionResponse>( `/inventory/${itemId}/in`, { locationId, quantity } );
        logInfo("InventoryServices -> stockIn:", res.data);
        return res.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
            logError("Failed to add stock API:", error.message);
            throw new Error(backendMessage || "Failed to add stock.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in stockIn:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while adding stock.");
    };
}

export const stockOut = async ( itemId: string, locationId: string, quantity: number ): Promise<StockTransactionResponse> => {
    try {
        const res = await api.post<StockTransactionResponse>(`/inventory/${itemId}/out`, { locationId, quantity });
        logInfo("inventoryServices -> stockOut:", res.data);
        return res.data
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
            logError("Failed to subtract stock API:", error.message);
            throw new Error(backendMessage || "Failed to subtract stock.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in stockOut:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while subtracting stock.");
    }
};