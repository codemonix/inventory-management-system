import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemActionResponse } from '../../types/system.types';

interface SystemState {
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: SystemState = {
    loading: false,
    error: null,
    successMessage: null,
};

const systemSlice = createSlice({
    name: 'system',
    initialState,
    reducers: {
        clearSystemStatus: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle loading states for all high-risk actions
            .addMatcher(
                (action) => action.type.startsWith('system/') && action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.successMessage = null;
                }
            )
            // Handle success states
            .addMatcher(
                (action) => action.type.startsWith('system/') && action.type.endsWith('/fulfilled'),
                (state, action: PayloadAction<SystemActionResponse>) => {
                    state.loading = false;
                    state.successMessage = action.payload.message || 'Action completed successfully.';
                }
            )
            // Handle error states
            .addMatcher(
                (action) => action.type.startsWith('system/') && action.type.endsWith('/rejected'),
                (state, action: PayloadAction<string | undefined>) => {
                    state.loading = false;
                    state.error = action.payload || 'A critical system action failed.';
                }
            );
    }
});

export const { clearSystemStatus } = systemSlice.actions;
export default systemSlice.reducer;