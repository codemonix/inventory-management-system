
import api, { isApiError } from "../api/api";
import { SystemActionResponse, ClearTarget } from "../types/system.types";

export const downloadBackup = async (): Promise<void> => {

    try {
        const response = await api.get<Blob>('/system/backup', { responseType: 'blob' });
    
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ims_backup_${new Date().toISOString().split('T')[0]}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    
        // Clean up
        window.URL.revokeObjectURL(url);
        logInfo("systemService -> Backup download initiated successfully")

    } catch (error) {
        if (isApiError(error)) {
            logError("Failed to download backup API:", error.message);
            throw new Error("Failed to download system backup. You may lack admin permissions.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in downloadBackup:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while downloading the backup.");
    }
};

export const restoreSystem = async (fileObj: File): Promise<SystemActionResponse> => {

    try {
        const formData = new FormData();
        formData.append('backupFile', fileObj);
    
        const response = await api.post('/system/restore', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        logInfo("systemService -> Restore initiated successfully");
        return response.data;

    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to restore system API:", error.message);
            throw new Error(backendMessage || "Failed to restore system from backup.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in restoreSystem:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while restoring the system.");
    }
    
};

export const clearSystemData = async (target: ClearTarget): Promise<SystemActionResponse> => {
    try {
        const response = await api.post<SystemActionResponse>('/system/clear', { target });
        logInfo(`systemService -> Clear ${target} initiated successfully`);
    
        return response.data; 
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to clear system data API:", error.message);
            throw new Error(backendMessage || `Failed to clear system data for ${target}.`);
        }
        if (error instanceof Error) {
            logError("Standard JS Error in clearSystemData:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while clearing system data.");
    }

};

export const performFactoryReset = async (confirmationPhrase: string): Promise<SystemActionResponse> => {
    try {
        const response = await api.post<SystemActionResponse>('/system/reset', { confirmation: confirmationPhrase });
        logInfo("systemService -> Factory reset initiated successfully");
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to perform factory reset API:", error.message);
            throw new Error(backendMessage || "Failed to perform factory reset. Check your confirmation phrase.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in performFactoryReset:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while attempting a factory reset.");
    }
};