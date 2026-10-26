import api, { isApiError } from "../api/api";
import { getBackendMessage } from "../utils/backendMessage";
import { logInfo, logError, logDebug } from "../utils/logger";
import {
    ITransfer,
    ITempTransfer,
    TransferHistoryFilters,
    TransferHistoryPage,
    TransferResponse,
    TempTransferResponse,
    TempTransferActionResponse,
} from "../types/transfer.types";

// Transfers

// One page of transfer history (newest first). Empty filter values are left out of the query.
export const getTransferHistory = async (
    filters: TransferHistoryFilters = {},
    page = 1,
    limit = 20,
    signal?: AbortSignal,
): Promise<TransferHistoryPage> => {
    const params: Record<string, string | number> = { page, limit };
    for (const [key, value] of Object.entries(filters)) {
        if (value && value !== 'all') params[key] = value;
    }
    try {
        const response = await api.get<TransferHistoryPage>("/transfers", { params, signal });
        logDebug("transferService -> getTransferHistory:", response.data);
        return response.data;
    } catch (error) {
        logError("transferService -> getTransferHistory error");
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to fetch transfers.");
        throw error instanceof Error ? error : new Error("Unknown error fetching transfers.");
    }
};

export const createTransfer = async (transfer: {
    fromLocation: string;
    toLocation: string;
    items: { item: string; quantity: number }[];
}): Promise<TransferResponse> => {
    try {
        const response =  await api.post<TransferResponse>("/transfers", transfer)
        logInfo("Transfer created successfully")
        return response.data;
    } catch (error) {
        logError("transferService -> createTransfer error");
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to create transfer.");
        throw error instanceof Error ? error : new Error("Unknown error creating transfer.");
    }
};

// Manager or admin only (enforced by the server)
export const confirmTransfer = async (transferId: string): Promise<TransferResponse> => {
    try {
        logDebug("transferService -> confirmTransfer -> id:", transferId);
        const response = await api.put<TransferResponse>(`/transfers/${transferId}/confirm`);
        logInfo("Transfer confirmed successfully, response:", response.data)
        return response.data;
    } catch (error) {
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to confirm transfer.");
        throw error instanceof Error ? error : new Error("Unknown error confirming transfer.");
    }
};


// Admin only (enforced by the server): stock goes back to the source location
export const cancelTransfer = async (transferId: string): Promise<TransferResponse> => {
    try {
        const response = await api.put<TransferResponse>(`/transfers/${transferId}/cancel`);
        logInfo("Transfer cancelled successfully");
        return response.data;
    } catch (error) {
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to cancel transfer.");
        throw error instanceof Error ? error : new Error("Unknown error cancelling transfer.");
    }
};

// Temp Transfer (Shopping Cart System)
export const getTempTransfer = async (): Promise<ITempTransfer> => {
    try {
        const response = await api.get<TempTransferResponse>("/transfers/temp");
        logInfo("Temp Transfer fetched successfully")
        logDebug("transferService -> getTempTransfer -> temp:", response.data.temp);
        return response.data.temp;
    } catch (error) {
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to fetch temp transfer.");
        throw error instanceof Error ? error : new Error("Unknown error fetching temp transfer.");
    }
} 


export const createTempTransfer = async (tempTransfer: Pick<ITempTransfer, "fromLocation" | "toLocation">): Promise<ITempTransfer> => {
    try {
        const response = await api.post<TempTransferResponse>("/transfers/temp/init", tempTransfer);
        logInfo("Temp Transfer created successfully")
        return response.data.temp;
    } catch (error) {
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to initialize temp transfer.");
        throw error instanceof Error ? error : new Error("Unknown error initializing temp transfer.");
    }

}

export const addItemToTempTransfer = async (item: { itemId: string, quantity: number, sourceLocationId: string }): Promise<TempTransferActionResponse> => {
    try {
        const response = await api.post<TempTransferActionResponse>("/transfers/temp/add", item);
        logInfo("Item added to temp transfer successfully");
        logDebug("transferService -> addItemToTempTransfer -> response:", response.data.temp);
        return response.data;
    } catch (error) {
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to add item to transfer.");
        throw error instanceof Error ? error : new Error("Unknown error adding item.");
    }
} 

export const removeItemFromTempTransfer = async (itemId: string) => {
    try {
        const response = await api.delete<TempTransferActionResponse>(`/transfers/temp/remove/${itemId}`);
        logInfo(`item ${itemId} removed from temp transfer successfully`);
        return response.data;
        } catch (error) { 
            if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to remove item from transfer.");
        throw error instanceof Error ? error : new Error("Unknown error removing item.");
    }
} 

// Throws the current user's draft away; its reserved stock returns to the shelf
export const discardTempTransfer = async (): Promise<void> => {
    try {
        await api.delete("/transfers/temp");
        logInfo("Temp Transfer discarded");
    } catch (error) {
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to discard transfer.");
        throw error instanceof Error ? error : new Error("Unknown error discarding transfer.");
    }
};

export const finalizeTempTransfer = async (): Promise<ITransfer> => {
    try {
        const response = await api.post<TransferResponse>("/transfers/temp/finalize");
        logInfo("Temp Transfer finalized successfully")
        return response.data.transfer;
    } catch (error) {
        if (isApiError(error)) throw new Error(getBackendMessage(error) || "Failed to finalize transfer.");
        throw error instanceof Error ? error : new Error("Unknown error finalizing transfer.");
    }
} 