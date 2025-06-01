

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import  getTransfers, getTempTransfer, createTempTransfer, addItemToTempTransfer, finalizeTempTransfer  from "../../services/transfersServices.js";
import { logDebug, logInfo } from "../../utils/logger.js";
// import { getTempTransfer, createTempTransfer, addItemToTempTransfer,finalizeTempTransfer, removeItemFromTempTransfer } from "../services/transfersServices.js";

import { getTransfers, getTempTransfer, 
    createTempTransfer, addItemToTempTransfer, 
    finalizeTempTransfer, removeItemFromTempTransfer } from "../../services/transfersServices.js";

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

const initialState = {
    tempTransfer: {
        fromLocation: "",
        toLocation: "",
        items: [],
    },
    status: 'idle',
    error: null,
    transfers: [],
    transferStatus: 'idle',
    transferError: null,
}

const transferSlice = createSlice({
    name: "transfer",
    initialState,
    reducers: {
        clearTransferState: ( state ) => {
            state.tempTransfer = {
                fromLocation: "",
                toLocation: "",
                items: [],
            };
            state.status = 'idel';
        }
    },
    extraReducers: ( builder ) => {
        builder
            // Load Transfers
            .addCase(loadTransfers.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadTransfers.fulfilled, ( state, action ) => {
                state.status = 'succeeded';
                state.transfers = action.payload;
                logInfo("Transfers loaded payload:", action.payload)
            })
            .addCase(loadTransfers.rejected, ( state, action ) => {
                state.status = 'failed';
                logDebug("loadTransfers error: ", action.error.message);
                state.error = action.error.message;
            })
            // Load Temp Transfer and related actions
            .addCase(loadTempTransfer.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadTempTransfer.fulfilled, ( state, action ) => {
                state.status = 'succeeded';
                state.tempTransfer = action.payload;
            })
            .addCase(loadTempTransfer.rejected, ( state, action ) => {
                state.status = 'failed';
                logDebug("loadTempTransfer error: ", action.error.message);
                state.error = action.error.message;
            })

            .addCase(createTransfer.pending, ( state ) => {
                state.status = 'loading';
                state.transferError = null;
            })

            .addCase(createTransfer.fulfilled, ( state, action ) => {
                state.status = 'succeeded';
                state.tempTransfer = action.payload;  
            })
            .addCase(createTransfer.rejected, ( state, action ) => {
                state.status = 'failed';
                logDebug("createTransfer/tempTransfer faled:", action.error.message)
                state.error = action.error.message
            })

            .addCase(addItem.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })

            .addCase(addItem.fulfilled, ( state, action ) => {
                state.state = 'succeeded';
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer.items = action.payload.items;
                }
                logInfo("addItem to tempTransfer:", action.payload.items)
            })

            .addCase(addItem.rejected, ( state, action ) => {
                state.status = 'failed';
                logInfo("addItem to temp transfer failed:", action.error.message)
                state.error = action.error.message
            })
            .addCase(finalizeTransfer.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(finalizeTransfer.fulfilled, ( state, action ) => {
                state.transfers.push(action.payload);
                state.tempTransfer = {
                    fromLocation: "",
                    toLocation: "",
                    items: [],
                };
                state.status = 'idel';
                logInfo("tempTranfsref finalized")
            })
            .addCase(finalizeTransfer.rejected, ( state, action ) => {
                state.status = 'failed';
                state.error = action.error.message;
                logDebug("finalize tempTransfer failed:", action.error.message)
            })

            .addCase(removeItem.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(removeItem.fulfilled, ( state, action ) => {
                state.status = 'succeeded';
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer.items = state.tempTransfer.items.filter(item => item.id !== action.payload.itemId);
                }
                logInfo("remove item from tempTransfer:", action.payload.items)
            })
            .addCase(removeItem.rejected, ( state, action ) => {
                state.status = 'failed';
                state.error = action.error.message
                logDebug("Remove item from tempTransfer failed:", action.error.message)
            })
    },
});



export default transferSlice.reducer;

