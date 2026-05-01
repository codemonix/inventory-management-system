import api, { isApiError } from "../api/api";
import { logInfo, logError, logDebug } from "../utils/logger";
import {
    ITransfer,
    ITempTransfer,
    TransferResponse,
    TempTransferResponse,
    TempTransferActionResponse,
    DeleteResponse
} from "../types/transfer.types";

// Transfers

export const getTransfers = async (): Promise<ITransfer[]> => {
    try {
        logDebug("Fetching transfers...")
        const response = await api.get<{transfers: ITransfer[]}>("/transfers")
        logInfo("Transfers Fetched successfully")
        return response.data.transfers;
    } catch (error) {
        logError("transferService.js -> getTransfers error");
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to fetch transfers.");
        throw error instanceof Error ? error : new Error("Unknown error fetching transfers.");
    }
} 

export const createTransfer = async (transfer: Omit<ITransfer, "id">): Promise<TransferResponse> => {
    try {
        const response =  await api.post<TransferResponse>("/transfers", transfer)
        logInfo("Transfer created successfully")
        return response.data;
    } catch (error) {
        logError("transferService.js -> createTransfer error");
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to create transfer.");
        throw error instanceof Error ? error : new Error("Unknown error creating transfer.");
    }
} 


export const updateTransfer = async (id: string, transfer: Partial<ITransfer>): Promise<TransferResponse> => {
    try {
        const response = await api.put<TransferResponse>(`/transfers/${id}`, transfer)
        logInfo("Transfer updated successfully")
        return response.data;
    } catch (error) {
        logError("transferService.js -> updateTransfer error");
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to update transfer.");
        throw error instanceof Error ? error : new Error("Unknown error updating transfer.");
    }
} 



export const deleteTransfer = async (id: string): Promise<DeleteResponse> => {
    try {
        const response = await api.delete<DeleteResponse>(`/transfers/${id}`);
        logInfo(`Transfer deleted successfully id: ${id}`);
        return response.data;
    } catch (error) {
        logError("transferService.js -> deleteTransfer error");
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to delete transfer.");
        throw error instanceof Error ? error : new Error("Unknown error deleting transfer.");
    }
} 


export const confirmTransfer = async (transfer: string): Promise<TransferResponse> => {
    try {
        logDebug("transferService -> confirmTransfer -> transfer:", transfer);
        const response = await api.put<TransferResponse>(`/transfers/${transfer}/confirm`);
        logInfo("Transfer confirmed successfully, response:", response.data)
        return response.data;
    } catch (error) {
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to confirm transfer.");
        throw error instanceof Error ? error : new Error("Unknown error confirming transfer.");
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
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to fetch temp transfer.");
        throw error instanceof Error ? error : new Error("Unknown error fetching temp transfer.");
    }
} 


export const createTempTransfer = async (tempTransfer: Pick<ITempTransfer, "fromLocation" | "toLocation">): Promise<ITempTransfer> => {
    try {
        const response = await api.post<TempTransferResponse>("/transfers/temp/init", tempTransfer);
        logInfo("Temp Transfer created successfully")
        return response.data.temp;
    } catch (error) {
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to initialize temp transfer.");
        throw error instanceof Error ? error : new Error("Unknown error initializing temp transfer.");
    }

}

export const addItemToTempTransfer = async (item: { item: string, quantity: number, sourceLocationId: string}): Promise<TempTransferActionResponse> => {
    try {
        const response = await api.post<TempTransferActionResponse>("/transfers/temp/add", item);
        logInfo("Item added to temp transfer successfully");
        logDebug("transferService -> addItemToTempTransfer -> response:", response.data.temp);
        return response.data;
    } catch (error) {
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to add item to transfer.");
        throw error instanceof Error ? error : new Error("Unknown error adding item.");
    }
} 

export const removeItemFromTempTransfer = async (itemId: string) => {
    try {
        const response = await api.delete<TempTransferActionResponse>(`/transfers/temp/remove/${itemId}`);
        logInfo(`item ${itemId} removed from temp transfer successfully`);
        return response.data;
        } catch (error) { 
            if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to remove item from transfer.");
        throw error instanceof Error ? error : new Error("Unknown error removing item.");
    }
} 

export const finalizeTempTransfer = async (): Promise<ITransfer> => {
    try {
        const response = await api.post<TransferResponse>("/transfers/temp/finalize");
        logInfo("Temp Transfer finalized successfully")
        return response.data.transfer;
    } catch (error) {
        if (isApiError(error)) throw new Error(error.response?.data?.message || "Failed to finalize transfer.");
        throw error instanceof Error ? error : new Error("Unknown error finalizing transfer.");
    }
} 