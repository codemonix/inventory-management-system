

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import  getTransfers, getTempTransfer, createTempTransfer, addItemToTempTransfer, finalizeTempTransfer  from "../../services/transfersServices.js";
import { logDebug } from "../../utils/logger.js";
// import { getTempTransfer, createTempTransfer, addItemToTempTransfer,finalizeTempTransfer, removeItemFromTempTransfer } from "../services/transfersServices.js";

import { getTransfers, getTempTransfer, createTempTransfer, addItemToTempTransfer, finalizeTempTransfer, removeItemFromTempTransfer } from "../../services/transfersServices.js";

export const loadTransfers = createAsyncThunk(
    'transfer/loadTransfers',
    async () => {
        const response = await getTransfers();
        logDebug("loadTransfers response: ", response);
        return response;
    }
        
)

// From here they are all for temporary transfer, not finalized yet

export const loadTempTransfer = createAsyncThunk(
    'transfer/loadTempTransfer',
    async () => {
        const response = await getTempTransfer();
        logDebug("loadTempTransfer response: ", response);
        return response;
    }
);

export const createTransfer = createAsyncThunk(
    'transfer/createTempTransfer',
    async ( { fromLocation, toLocation } ) => {
        const response = await createTempTransfer( { fromLocation, toLocation } );
        logDebug("createTempTransfer response: ", response);
        return response;
    }
);

export const addItem = createAsyncThunk(
    'transfer/addItemToTempTransfer',
    async ( { itemId, quantity } ) => {
        const response = await addItemToTempTransfer( { itemId, quantity } );
        logDebug("addItemToTempTransfer response: ", response);
        return response;
    }
);

export const finalizeTransfer = createAsyncThunk(
    'transfer/finalizeTempTransfer',
    async () => {
        const response = await finalizeTempTransfer();
        logDebug("finalizeTempTransfer response: ", response);
        return response;
    }
);

export const removeItem = createAsyncThunk(
    'transfer/removeItemFromTempTransfer',
    async ( { itemId } ) => {
        const response = await removeItemFromTempTransfer( { itemId } );
        logDebug("removeItemFromTempTransfer response: ", response);
        return response;
    }
);

const initialState = {
    tempTransfer: {
        fromLocation: "",
        toLocation: "",
        items: [],
    },
    loading: false,
    error: null,
    transfers: [],
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
        }
    },
    extraReducers: ( builder ) => {
        builder
            // Load Transfers
            .addCase(loadTransfers.pending, ( state ) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadTransfers.fulfilled, ( state, action ) => {
                state.loading = false;
                state.transfers = action.payload;
            })
            .addCase(loadTransfers.rejected, ( state, action ) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Load Temp Transfer and related actions
            .addCase(loadTempTransfer.pending, ( state ) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadTempTransfer.fulfilled, ( state, action ) => {
                state.loading = false;
                state.tempTransfer = action.payload;
            })
            .addCase(loadTempTransfer.rejected, ( state, action ) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createTransfer.fulfilled, ( state, action ) => {
                state.tempTransfer = action.payload;
                
            })
            .addCase(addItem.fulfilled, ( state, action ) => {
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer.items = action.payload.items;
                }
            })
            .addCase(finalizeTransfer.fulfilled, ( state, action ) => {
                state.transfers.push(action.payload);
                state.tempTransfer = {
                    fromLocation: "",
                    toLocation: "",
                    items: [],
                };
            })
            .addCase(removeItem.fulfilled, ( state, action ) => {
                if (state.tempTransfer && state.tempTransfer.items) {
                    state.tempTransfer.items = state.tempTransfer.items.filter(item => item.id !== action.payload.itemId);
                }
            })
    },
});



export default transferSlice.reducer;

