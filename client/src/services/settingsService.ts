
import api, { isApiError } from "../api/api";
import { getBackendMessage } from "../utils/backendMessage";
import { logError, logInfo } from "../utils/logger";
import { ISystemSettings } from "../types/setting.types";

export const fetchSystemSettings = async (): Promise<ISystemSettings> => {
    try {
        const response = await api.get<ISystemSettings>('/system/settings');
        logInfo("settingsService -> fetchSystemSettings successful.");
        return response.data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
            logError("Failed to fetch settings API:", error.message);
            throw new Error(backendMessage || "Failed to fetch system settings.");
        }
        if (error instanceof Error) throw error;
        throw new Error("An unknown error occurred while fetching settings.");
    }
};

export const updateSystemSettings = async (settingsData: Partial<ISystemSettings>): Promise<ISystemSettings> => {
    try {
        const response = await api.put<ISystemSettings>('/system/settings', settingsData);
        logInfo("settingsService -> updateSystemSettings successful.");
        return response.data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
            logError("Failed to update settings API:", error.message);
            throw new Error(backendMessage || "Failed to update system settings.");
        }
        if (error instanceof Error) throw error;
        throw new Error("An unknown error occurred while updating settings.");
    }
};