import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logError } from '../../utils/logger';

export const fetchSystemLogs = createAsyncThunk(
    'system/fetchLogs',
    async ({skip = 0, page , limit = 50, level = 'all', sortBy = 'timestamp', sortOrder = 'desc' }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/system/logs?skip=${skip}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=${limit}&level=${level}`);
            return response.data;
        } catch (error) {
            logError("system.service.js -> fetchSystemLogs -> Failed to fetch system logs", error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs');
        }
    }
);

export const fetchSystemSettings = createAsyncThunk(
    'system/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/system/settings');
            return response.data;
        } catch (error) {
            logError("system.service.js -> fetchSystemSettings -> Failed to fetch system settings", error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
        }
    }
);

export const updateSystemSettings = createAsyncThunk(
    'system/updateSettings',
    async (settingsData, { rejectWithValue }) => {
        try {
            const response = await api.put('/system/settings', settingsData);
            return response.data;
        } catch (error) {
            logError("system.service.js -> updateSystemSettings -> Failed to update system settings", error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
        }
    }
);

export const clearSystemLogs = createAsyncThunk(
    'system/clearLogs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete('/system/logs');
            return response.data;
        } catch (error) {
            logError("system.service.js -> clearSystemLogs -> Failed to clear system logs", error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to clear logs');
        }
    }
);