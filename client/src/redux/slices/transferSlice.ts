import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITempTransfer, TempTransferActionResponse } from "../../types/transfer.types";
import {
    loadTempTransfer, 
    createTempTransfer, 
    addItem, 
    finalizeTransfer, 
    removeItem
} from "../thunks/transferThunks";
import { logDebug } from "../../utils/logger";

interface TempTransferState {
    data: ITempTransfer | null;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
    tempTransferStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}


// In Enterprise React, it is safer to start complex objects as 'null' 
// rather than an empty object structure. It makes it mathematically 
// provable whether a cart actually exists in memory.
const initialState: TempTransferState = {
    data: null,
    loading: false,
    error: null,
    successMessage: null,
    tempTransferStatus: 'idle',
};

const tempTransferSlice = createSlice({
    name: "transfer",
    initialState,
    reducers: {
        clearTempTransferState: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadTempTransfer.fulfilled, (state, action: PayloadAction<ITempTransfer>) => {
                state.data = action.payload;
                state.tempTransferStatus = 'succeeded';
            })
            .addCase(createTempTransfer.fulfilled, (state, action: PayloadAction<ITempTransfer>) => {
                state.data = action.payload;
            })
            .addCase(addItem.fulfilled, (state, action: PayloadAction<TempTransferActionResponse>) => {
                // Adjust 'action.payload.temp' based on the exact property name d ||
                // your backend sends inside the TempTransferActionResponse
                logDebug("transferSlice -> addItem -> action.payload.temp: ", action.payload.temp);
                state.data =  action.payload.temp;
                state.tempTransferStatus = 'succeeded';
                state.successMessage = "Item successfully added.";
                logDebug("transferSlice -> addItem -> state.data: ", state);
            })
            .addCase(removeItem.fulfilled, (state, action: PayloadAction<TempTransferActionResponse>) => {
                state.data = action.payload.temp || state.data;
                state.successMessage = "Item successfully removed.";
            })
            .addCase(finalizeTransfer.fulfilled, (state) => {
                // When finalized, the cart is empty! We don't push to a history array
                // because the historical transfers are no longer in Redux.
                state.data = null;
                state.successMessage = "Transfer finalized successfully!";
            });

        // Shared status handling
        builder
            // Catch all starting thunks
            .addMatcher(
                (action) => action.type.startsWith('tempTransfer/') && action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.successMessage = null;
                    state.tempTransferStatus = 'loading';
                }
            )
            // Catch all finishing thunks
            .addMatcher(
                (action) => action.type.startsWith('tempTransfer/') && action.type.endsWith('/fulfilled'),
                (state) => {
                    state.loading = false;
                    state.error = null;
                }
            )
            // Catch all failing thunks
            .addMatcher(
                (action) => action.type.startsWith('tempTransfer/') && action.type.endsWith('/rejected'),
                (state, action: PayloadAction<string | undefined>) => {
                    state.loading = false;
                    state.error = action.payload || "A transfer operation failed.";
                    state.tempTransferStatus = 'failed';
                }
            );
    },
});

export const { clearTempTransferState } = tempTransferSlice.actions;
export default tempTransferSlice.reducer;