import api, { isApiError} from "../api/api.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";
import {
    FetchInventoryParams,
    InventoryPaginatedResult,
    IInventoryRecord,
    StockTransactionResponse
} from "../types/inventory.types.js";


export const fetchInventory = async (params: FetchInventoryParams = {}): Promise<InventoryPaginatedResult> => {
    const { page = 1, limit = 10, sort = 'name', search = null } = params;
    logInfo("page, limit, sort, search:", page, limit, sort, search);
    try {
        const res = await api.get<InventoryPaginatedResult>(`/inventory?page=${page}&limit=${limit}&sort=${sort}&search=${search}`);
        logDebug("InventoryServices -> fetchInventory:", res.data);
        return res.data;
    } catch (error: any) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
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

export const fetchFullInventory = async (): Promise<IInventoryRecord[]> => {
    try {
        const res = await api.get<IInventoryRecord[]>(`/inventory/full`);
        logDebug("InventoryServices -> fetchFullInventory:", res.data);
        return res.data; 
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to fetch full inventory API:", error.message);
            throw new Error(backendMessage || "Failed to fetch full inventory.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in fetchFullInventory:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while fetching full inventory.");
    }
};

export const stockIn = async (itemId: string, locationId: string, quantity: number ): Promise<StockTransactionResponse> => {
    try {
        const res = await api.post<StockTransactionResponse>( `/inventory/${itemId}/in`, { locationId, quantity } );
        logInfo("InventoryServices -> stockIn:", res.data);
        return res.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
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
            const backendMessage = error.response?.data?.message;
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