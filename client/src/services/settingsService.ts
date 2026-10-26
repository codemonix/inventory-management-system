
import api, { isApiError } from "../api/api";
import { getBackendMessage } from "../utils/backendMessage";
import { logError, logInfo } from "../utils/logger";
import { ISystemSettings, PublicSettings } from "../types/setting.types";

export const fetchSystemSettings = async (): Promise<ISystemSettings> => {
    try {
        const response = await api.get<{ settings: ISystemSettings }>('/system/settings');
        logInfo("settingsService -> fetchSystemSettings successful.");
        return response.data.settings;
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

// Only the fields that are sent are changed
export const updateSystemSettings = async (
    settingsData: Partial<Pick<ISystemSettings, 'logLevel' | 'enableDbLogging' | 'demoMode'>>,
): Promise<ISystemSettings> => {
    try {
        const response = await api.put<{ settings: ISystemSettings }>('/system/settings', settingsData);
        logInfo("settingsService -> updateSystemSettings successful.");
        return response.data.settings;
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

// Readable without logging in; used by the login page. Falls back to "off" if unreachable.
export const fetchPublicSettings = async (): Promise<PublicSettings> => {
    try {
        const response = await api.get<PublicSettings>('/system/public-settings');
        return { demoMode: Boolean(response.data.demoMode) };
    } catch (error: unknown) {
        logError("Failed to fetch public settings:", error instanceof Error ? error.message : error);
        return { demoMode: false };
    }
};
