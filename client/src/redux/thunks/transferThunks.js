import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
    getTransfers, 
    getTempTransfer, 
    createTempTransfer, 
    addItemToTempTransfer, 
    finalizeTempTransfer, 
    removeItemFromTempTransfer, 
    confirmTransfer as confirmTransferApi 
} from "../../services/transfersServices.js";
import { logDebug, logInfo, logError } from "../../utils/logger";

// Standard Transfers

export const loadTransfers = createAsyncThunk(
    'transfer/loadTransfers',
    async (_, thunkAPI) => {
        try {
            const response = await getTransfers();
            logInfo("loadTransfers response: ", response);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load transfers';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const confirmTransfer = createAsyncThunk(
    'transfer/confirmTransfer',
    async (transferId, thunkAPI) => {
        try {
            const response = await confirmTransferApi(transferId);
            logInfo('confirmTransfer response:', response);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Confirm transfer failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Temp Transfer

export const loadTempTransfer = createAsyncThunk(
    'transfer/loadTempTransfer',
    async (_, thunkAPI) => {
        try {
            const response = await getTempTransfer();
            logInfo("loadTempTransfer response: ", response);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load temporary transfer';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const createTransfer = createAsyncThunk(
    'transfer/createTempTransfer',
    async ({ fromLocation, toLocation }, thunkAPI) => {
        try {
            const response = await createTempTransfer({ fromLocation, toLocation });
            logInfo("createTempTransfer response: ", response);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create temporary transfer';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const addItem = createAsyncThunk(
    'transfer/addItemToTempTransfer',
    async ({ itemId, quantity, sourceLocationId }, thunkAPI) => {
        try {
            const response = await addItemToTempTransfer({ itemId, quantity, sourceLocationId });
            logInfo("addItemToTempTransfer response: ", response);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add item to transfer';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const finalizeTransfer = createAsyncThunk(
    'transfer/finalizeTempTransfer',
    async (_, thunkAPI) => {
        try {
            const response = await finalizeTempTransfer();
            logInfo("finalizeTempTransfer response: ", response);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to finalize transfer';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const removeItem = createAsyncThunk(
    'transfer/removeItemFromTempTransfer',
    async ({ itemId }, thunkAPI) => {
        try {
            const response = await removeItemFromTempTransfer({ itemId });
            logInfo("removeItemFromTempTransfer response: ", response);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove item from transfer';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// -- Helper functions --

export const refetchTransfers = async (dispatch) => {
    try {
        await dispatch(loadTransfers()).unwrap();
        await dispatch(loadTempTransfer()).unwrap();
    } catch (error) {
        logError("Refetching transfers failed:", error.message)
    }
};

