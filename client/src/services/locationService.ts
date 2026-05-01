import api, { isApiError } from "../api/api.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";
import { ILocation, LocationResponse, DeleteResponse } from "../types/location.types.js";



export const getLocations = async (): Promise<ILocation[]> => {
    try {
        const response = await api.get("/locations"); // { locations: [...] }
        logInfo("getLocations response:", response.data);
        return response.data.locations;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to fetch locations API:", error.message);
            throw new Error(backendMessage || "Failed to fetch locations.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in getLocations:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while fetching locations.");

    }
} 

export const createLocation = async (location: Omit<ILocation, "id">): Promise<LocationResponse> => {
    try {
        const response = await api.post<LocationResponse>("/locations", location);
        logInfo("locationService -> createLocation response:", response.data)
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to create location API:", error.message);
            throw new Error(backendMessage || "Failed to create location.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in createLocation:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while creating the location.");
    }
} 

export const updateLocation = async (id: string, location: Partial<ILocation>) => {
    try {
        const response = await api.put<{location: ILocation}>(`/locations/${id}`, location);
        logDebug("locationService -> updateLocation response:", response.data.location);
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to update location API:", error.message);
            throw new Error(backendMessage || "Failed to update location.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in updateLocation:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while updating the location.");
    }
} 

export const deleteLocation = async (id: string): Promise<DeleteResponse> => {
    try {
        const response = await api.delete<DeleteResponse>(`/locations/${id}`);
        logInfo(`locationService -> location id: ${id} has beed deleted`)
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to delete location API:", error.message);
            
            // This is critical if the backend prevents deleting a location that currently holds stock
            throw new Error(backendMessage || "Failed to delete location.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in deleteLocation:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while deleting the location.");
    }
} 