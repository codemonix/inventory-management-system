import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchSystemSettings, updateSystemSettings } from "../thunks/settingsThunks";
import { ISystemSettings } from "../../types/setting.types";


interface SettingsState {
    data: ISystemSettings | null;
    loading: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    data: null,
    loading: false,
    error: null,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearSettingsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Settings
            .addCase(fetchSystemSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSystemSettings.fulfilled, (state, action: PayloadAction<ISystemSettings>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchSystemSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load settings';
            })
            // Update Settings
            .addCase(updateSystemSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSystemSettings.fulfilled, (state, action: PayloadAction<ISystemSettings>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(updateSystemSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update settings';
            });
    }
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;