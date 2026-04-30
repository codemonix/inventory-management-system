import { createAsyncThunk } from '@reduxjs/toolkit';
import { logError } from '../../utils/logger';
import { fetchSystemSettings as fetchSettingsAPI, updateSystemSettings as updateSettingsAPI } from '../../services/settingsService';
import { ISystemSettings } from '../../types/setting.types';

export const fetchSystemSettings = createAsyncThunk<
    ISystemSettings,
    void,
    { rejectValue: string }
>(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchSettingsAPI();
        } catch (error: unknown) {
            logError("settingsThunks -> fetchSystemSettings -> Failed", error instanceof Error ? error.message : "Unknown error");
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue('An unknown error occurred fetching settings.');
        }
    }
);

export const updateSystemSettings = createAsyncThunk<
    ISystemSettings,
    Partial<ISystemSettings>,
    { rejectValue: string }
>(
    'settings/updateSettings',
    async (settingsData, { rejectWithValue }) => {
        try {
            return await updateSettingsAPI(settingsData);
        } catch (error: unknown) {
            logError("settingsThunks -> updateSystemSettings -> Failed", error instanceof Error ? error.message : "Unknown error");
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue('An unknown error occurred updating settings.');
        }
    }
);