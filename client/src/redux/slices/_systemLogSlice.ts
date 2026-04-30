import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchSystemLogs, clearSystemLogs } from '../thunks/systemLogThunks';
import { ISystemLog, PaginatedSystemLogs } from '../../types/systemLog.types';

interface SystemLogState {
    logs: ISystemLog[];
    total: number;
    page: number;
    pages: number;
    loading: boolean;
    error: string | null;
}

const initialState: SystemLogState = {
    logs: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null,
};

const systemLogSlice = createSlice({
    name: 'systemLogs',
    initialState,
    reducers: {
        clearLogError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Logs
            .addCase(fetchSystemLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSystemLogs.fulfilled, (state, action: PayloadAction<PaginatedSystemLogs>) => {
                state.loading = false;
                state.logs = action.payload.logs;
                state.total = action.payload.totalLogs;
                state.page = action.payload.currentPage || 1;
                state.pages = action.payload.totalPages || 1;
            })
            .addCase(fetchSystemLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load logs';
            })
            // Clear Logs
            .addCase(clearSystemLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearSystemLogs.fulfilled, (state) => {
                state.loading = false;
                state.logs = [];
                state.total = 0;
            })
            .addCase(clearSystemLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to clear logs';
            });
    }
});

export const { clearLogError } = systemLogSlice.actions;
export default systemLogSlice.reducer;