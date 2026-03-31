
import { createSlice } from "@reduxjs/toolkit";
import { logDebug, logInfo } from "../../utils/logger.js";

import {
    loadTransfers, 
    loadTempTransfer, 
    createTransfer, 
    addItem, 
    finalizeTransfer, 
    removeItem, 
    confirmTransfer
} from "../thunks/transferThunks.js";

const initialState = {
    tempTransfer: {
        fromLocation: "",
        toLocation: "",
        items: [],
    },
    tempTransferStatus: 'idle',
    error: null,
    transfers: [],
    transferStatus: 'idle',
    transferError: null,
}

const transferSlice = createSlice({
    name: "transfer",
    initialState,
    reducers: {
        clearTempTransferState: ( state ) => {
            state.tempTransfer = {
                fromLocation: "",
                toLocation: "",
                items: [],
            };
            state.tempTransferStatus = 'idle';
            state.transferStatus = 'idle'
            state.error = null;
            state.transferError = null;
        }
    },
    extraReducers: ( builder ) => {
        builder
            // Load Transfers
            .addCase(loadTransfers.pending, ( state ) => {
                state.transferStatus = 'loading';
                state.transferError = null;
            })
            .addCase(loadTransfers.fulfilled, ( state, action ) => {
                state.transferStatus = 'succeeded';
                state.transfers = action.payload;
                logInfo("Transfers loaded, payload:", action.payload)
            })
            .addCase(loadTransfers.rejected, ( state, action ) => {
                state.transferStatus = 'failed';
                state.transferError = action.payload || action.error.message;
                logDebug("loadTransfers error: ", state.transferError)
            })

            // Confirm receiving Transfer package
            .addCase(confirmTransfer.pending, ( state ) => {
                state.transferStatus = 'loading';
                state.transferError = null;
            })
            .addCase(confirmTransfer.fulfilled, ( state, action ) => {
                state.transferStatus = 'succeeded';
                const index = state.transfers.findIndex( t => t._id === action.payload.transfer._id);
                if ( index !== -1 ) {
                    state.transfers[index] = action.payload.transfer;
                }
            })
            .addCase(confirmTransfer.rejected, ( state, action ) => {
                state.transferStatus = 'failed';
                state.transferError = action.payload || action.error.message;
                logDebug("Confirm Transfer failed:", state.transferError)
            })
            
            
            // Load Temp Transfer 
            .addCase(loadTempTransfer.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })
            .addCase(loadTempTransfer.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'succeeded';
                state.tempTransfer = action.payload;
            })
            .addCase(loadTempTransfer.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                state.error = action.payload || action.error.message;
                logDebug("loadTempTransfer error: ", state.error);
            })

            // Create Temp Transfer
            .addCase(createTransfer.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })

            .addCase(createTransfer.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'succeeded';
                state.tempTransfer = action.payload;  
            })
            .addCase(createTransfer.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                state.error = action.payload || action.error.message;
                logDebug("createTransfer/tempTransfer faled:", state.error)
            })


            // Add Item to Temp Transfer
            .addCase(addItem.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })

            .addCase(addItem.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'succeeded';
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer = action.payload;
                }
                logInfo("Item added to Temp transfer:", action.payload.items);
            })

            .addCase(addItem.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                state.error = action.payload || action.error.message;
                logInfo("addItem to temp transfer failed:", state.error);
            })

            // Finalize Temp Transfer
            .addCase(finalizeTransfer.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })
            .addCase(finalizeTransfer.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'idle';
                state.transfers.push(action.payload);
                state.tempTransfer = {
                    fromLocation: "",
                    toLocation: "",
                    items: [],
                };
                logInfo("tempTransfer finalized")
            })
            .addCase(finalizeTransfer.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                state.error = action.payload || action.error.message;
                logDebug("finalize tempTransfer failed:", state.error)
            })

            // Remove Item from Temp Transfer
            .addCase(removeItem.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })
            .addCase(removeItem.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'succeeded';
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer = action.payload;
                    logInfo("transferSlice.js -> removeItem from tempTransfer:", action.payload.items);
                }
                logInfo("remove item from tempTransfer:", action.payload.items)
            })
            .addCase(removeItem.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                state.error = action.payload || action.error.message;
                logDebug("Remove item from tempTransfer failed:", state.error)
            })

    },
});


export const { clearTempTransferState } = transferSlice.actions;
export default transferSlice.reducer;

