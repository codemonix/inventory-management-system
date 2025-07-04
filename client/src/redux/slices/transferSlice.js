

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logDebug, logInfo } from "../../utils/logger.js";

import { getTransfers, getTempTransfer, 
    createTempTransfer, addItemToTempTransfer, 
    finalizeTempTransfer, removeItemFromTempTransfer, confirmTransfer as confirmTransferApi } from "../../services/transfersServices.js";

export const loadTransfers = createAsyncThunk(
    'transfer/loadTransfers',
    async () => {
        const response = await getTransfers();
        logInfo("loadTransfers response: ", response);
        return response;
    }
        
)

// From here they are all for temporary transfer, not finalized yet

export const loadTempTransfer = createAsyncThunk(
    'transfer/loadTempTransfer',
    async () => {
        const response = await getTempTransfer();
        logInfo("loadTempTransfer response: ", response);
        return response;
    }
);

// this will create Temporary Transfer package, there is no direct transfer creation
export const createTransfer = createAsyncThunk(
    'transfer/createTempTransfer',
    async ( { fromLocation, toLocation } ) => {
        const response = await createTempTransfer( { fromLocation, toLocation } );
        logInfo("createTempTransfer response: ", response);
        return response;
    }
);

export const addItem = createAsyncThunk(
    'transfer/addItemToTempTransfer',
    async ( { itemId, quantity, sourceLocationId } ) => {
        const response = await addItemToTempTransfer( { itemId, quantity, sourceLocationId } );
        logInfo("addItemToTempTransfer response: ", response);
        return response;
    }
);

export const finalizeTransfer = createAsyncThunk(
    'transfer/finalizeTempTransfer',
    async () => {
        const response = await finalizeTempTransfer();
        logInfo("finalizeTempTransfer response: ", response);
        return response;
    }
);

export const removeItem = createAsyncThunk(
    'transfer/removeItemFromTempTransfer',
    async ( { itemId } ) => {
        const response = await removeItemFromTempTransfer( { itemId } );
        logInfo("removeItemFromTempTransfer response: ", response);
        return response;
    }
);

// this one is Not for tempTransfer
export const confirmTransfer = createAsyncThunk(
    'transfer/confirmTransfer',
    async ( transferId, thunkApi ) => {
        try {
            const response = await confirmTransferApi( transferId );
            logInfo('confirmTransfer response:', response);
            return response;
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || 'Confirm failed')
        }
    }
);

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
        }
    },
    extraReducers: ( builder ) => {
        builder
            // Load Transfers
            .addCase(loadTransfers.pending, ( state ) => {
                state.transferStatus = 'loading';
                state.error = null;
            })
            .addCase(loadTransfers.fulfilled, ( state, action ) => {
                state.transferStatus = 'succeeded';
                state.transfers = action.payload;
                logInfo("Transfers loaded payload:", action.payload)
            })
            .addCase(loadTransfers.rejected, ( state, action ) => {
                state.transferStatus = 'failed';
                console.error("loadTransfers error: ", action.error.message);
                state.error = action.error.message;
            })
            // Load Temp Transfer and related actions
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
                logDebug("loadTempTransfer error: ", action.error.message);
                state.error = action.error.message;
            })

            .addCase(createTransfer.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.transferError = null;
            })

            .addCase(createTransfer.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'succeeded';
                state.tempTransfer = action.payload;  
            })
            .addCase(createTransfer.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                logDebug("createTransfer/tempTransfer faled:", action.error.message)
                state.error = action.error.message
            })

            .addCase(addItem.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })

            .addCase(addItem.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'succeeded';
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer.items = action.payload.items;
                }
                logInfo("addItem to tempTransfer:", action.payload.items)
            })

            .addCase(addItem.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                logInfo("addItem to temp transfer failed:", action.error.message)
                state.error = action.error.message
            })
            .addCase(finalizeTransfer.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })
            .addCase(finalizeTransfer.fulfilled, ( state, action ) => {
                state.transfers.push(action.payload);
                state.tempTransfer = {
                    fromLocation: "",
                    toLocation: "",
                    items: [],
                };
                state.tempTransferStatus = 'idel';
                logInfo("tempTranfsref finalized")
            })
            .addCase(finalizeTransfer.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                state.error = action.error.message;
                logDebug("finalize tempTransfer failed:", action.error.message)
            })

            .addCase(removeItem.pending, ( state ) => {
                state.tempTransferStatus = 'loading';
                state.error = null;
            })
            .addCase(removeItem.fulfilled, ( state, action ) => {
                state.tempTransferStatus = 'succeeded';
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer.items = state.tempTransfer.items.filter(item => item.id !== action.payload.itemId);
                }
                logInfo("remove item from tempTransfer:", action.payload.items)
            })
            .addCase(removeItem.rejected, ( state, action ) => {
                state.tempTransferStatus = 'failed';
                state.error = action.error.message;
                logDebug("Remove item from tempTransfer failed:", action.error.message)
            })
            .addCase(confirmTransfer.pending, ( state ) => {
                state.transferStatus = 'loading';
                state.error = null;
            })
            .addCase(confirmTransfer.fulfilled, ( state, action ) => {
                state.transferStatus = 'succeeded';
                state.error = null;
                const index = state.transfers.findIndex( t => t._id === action.payload.transfer._id);
                if ( index !== -1 ) {
                    state.transfers[index] = action.payload.transfer;
                }
            })
            .addCase(confirmTransfer.rejected, ( state, action ) => {
                state.transferStatus = 'failed';
                state.error = action.error.message;
                logDebug("Confirm Transfer failed:", action.error.message)
            })
    },
});


export const { clearTempTransferState } = transferSlice.actions;
export default transferSlice.reducer;

