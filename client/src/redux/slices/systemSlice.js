import { createSlice } from '@reduxjs/toolkit';
import { 
    fetchSystemLogs, 
    fetchSystemSettings, 
    updateSystemSettings, 
    clearSystemLogs 
} from '../thunks/systemThunks';

const systemSlice = createSlice({
    name: 'system',
    initialState: {
        logs: [],
        totalPages: 1,
        currentPage: 1,
        totalLogs: 0,
        settings: {
            logLevel: 'info',
            enableDbLogging: true
        },
        isLoading: false,
        error: null,
    },
    reducers: {
        clearSystemError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Logs
            .addCase(fetchSystemLogs.pending, (state) => { state.isLoading = true; })
            .addCase(fetchSystemLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload.logs;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
                state.totalLogs = action.payload.totalLogs;
            })
            .addCase(fetchSystemLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Settings
            .addCase(fetchSystemSettings.fulfilled, (state, action) => {
                state.settings = action.payload;
            })
            // Update Settings
            .addCase(updateSystemSettings.fulfilled, (state, action) => {
                state.settings = action.payload;
            })
            // Clear Logs
            .addCase(clearSystemLogs.fulfilled, (state) => {
                state.logs = [];
                state.totalLogs = 0;
                state.totalPages = 1;
            });
    }
});

export const { clearSystemError } = systemSlice.actions;
export default systemSlice.reducer;