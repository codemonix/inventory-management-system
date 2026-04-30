import api, { isApiError } from "../api/api.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";
import {
    IItem,
    PaginatedItemsResult,
    GetItemsParams,
    DeleteResponse
} from "../types/item.types.js";



export const getAllItems = async (): Promise<{items: IItem[]}> => {
    try {
        const response = await api.get<{items: IItem[]}>("/items/all");
        logInfo("getAllItems response:", response.data);
        return response.data; // { items: [{ id, name, description, price, imageUrl }] }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Get All Items failed"
        logError("Failed to fetch items:", errorMessage);
        throw error;
    }
}

export const getPaginatedItems = async (params: GetItemsParams= {}): Promise<PaginatedItemsResult> => {
    logDebug("itemsService -> getPaginatedItems params:", params);
    const { page = 1, limit = 20, search = "", sort = "name_asc" } = params;
    try {
        const response = await api.get<{result: PaginatedItemsResult}>(`/items?page=${page}&limit=${limit}&search=${search}&sort=${sort}`);
        logInfo("getPaginatedItems response:", response.data)
        return response.data.result
    } catch (error) {
        // Is it a network/Axios error?
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;

            // If it's a 400 Bad Request AND we got a message from Express, throw it
            if (error.response?.status === 400 && typeof backendMessage === 'string') {
                throw new Error(backendMessage);
            }

            // Otherwise, log the network error and throw a safe fallback
            logError("Failed to fetch paginated items:", error.message);
            throw new Error(backendMessage || "Failed to fetch items.");
        }

        // Is it a standard JavaScript error?
        if (error instanceof Error) {
            logError("Standard JS Error in getPaginatedItems:", error.message);
            throw error;
        }

        // Absolute fallback
        throw new Error("An unknown error occurred while fetching paginated items.");
    }
    
}

export const createItem = async (item: Omit<IItem, "id">): Promise<IItem> => {
    try {
        const response = await api.post<{item: IItem}>("/items", item); // { item: { id, name, description, price } }
        return response.data.item;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("createItem API failed:", error.message);
            // We pass the exact backend validation error (like "code already exists") up to the UI
            throw new Error(backendMessage || "Failed to create item.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in createItem:", error.message);
            throw error;
        }

        // Absolute fallback
        throw new Error("An unknown error occurred while creating the item.");
    }

} 

export const updateItem = async (id: string, item: Partial<IItem>): Promise<{item: IItem}> => {

    try {
        const response = await api.put<{item: IItem}>(`/items/${id}`, item); // { item: { id, name, description, price } }
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("updateItem API failed:", error.message);
            // We pass the exact backend validation error 
            throw new Error(backendMessage || "Failed to update item.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in UpdateItem:", error.message);
            throw error;
        }

        // Absolute fallback
        throw new Error("An unknown error occurred while updating the item.");
    }
} 

export const deleteItem = async (id: string): Promise<DeleteResponse> => {
    try {
        const response = await api.delete<DeleteResponse>(`/items/${id}`);
        return response.data; // { message: "Item deleted successfully" }

    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError(`deleteItem API failed for id ${id}:`, error.message);
            
            // Network Error. 
            throw new Error(backendMessage || "Failed to delete item.");
        }
        
        if (error instanceof Error) {
            logError("Standard JS Error in deleteItem:", error.message);
            
            // Standard Error. We explicitly throw.
            throw error;
        }

        // Absolute fallback. We explicitly throw.
        throw new Error("An unknown error occurred while deleting the item.");
    }


} 

export const updateImageItem = async (itemId: string, imageUrl: string): Promise<IItem>  => {
    try {
        const resposne = await api.patch<{item: IItem}>(`/items/${itemId}/update-image`, { imageUrl });
        return resposne.data.item; // { item: { id, name, description, price, imageUrl } }
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError(`updateImageItem API failed for id ${itemId}:`, error.message);
            
            // Network Error
            throw new Error(backendMessage || "Failed to update item image.");
        }
        
        if (error instanceof Error) {
            logError("Standard JS Error in updateImageItem:", error.message);
            
            // Standard Error
            throw error;
        }

        // Absolute fallback. 
        throw new Error("An unknown error occurred while updating the item image.");
    }
};

export const fetchItemImage = async ( filename: string ): Promise<string> =>{
    logInfo("fetchItemImage filename:", filename);
    const splitedFilename = filename.split('/');
    logInfo("fetchItemImage split:", splitedFilename);
    const newFilename = splitedFilename[splitedFilename.length - 1];
    logInfo("newfilename:", newFilename)
    try {
        const res = await api.get<Blob>(`/items/image/${newFilename}`, { responseType: 'blob'});
        const objectUrl = URL.createObjectURL(res.data);
        logDebug(objectUrl);
        return objectUrl;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError(`fetchItemImage API failed for filename ${filename}:`, error.message);
            
            // Network Error
            throw new Error(backendMessage || "Failed to fetch item image.");
        }
        
        if (error instanceof Error) {
            logError("Standard JS Error in fetchItemImage:", error.message);
            
            // Standard Error
            throw error;
        }

        // Absolute fallback. 
        throw new Error("An unknown error occurred while fetching the item image.");
    }
}


