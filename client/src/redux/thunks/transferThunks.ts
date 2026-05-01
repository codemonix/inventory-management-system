import { createAsyncThunk } from '@reduxjs/toolkit';
import { logDebug, logError } from '../../utils/logger';

import { 
    getTempTransfer as getTempTransferAPI, 
    createTempTransfer as createTempTransferAPI, 
    addItemToTempTransfer as addItemAPI, 
    finalizeTempTransfer as finalizeTempTransferAPI, 
    removeItemFromTempTransfer as removeItemAPI 
} from '../../services/transferService';

import { 
    ITempTransfer, 
    ITransfer, 
    TempTransferActionResponse 
} from '../../types/transfer.types';

export const loadTempTransfer = createAsyncThunk<
    ITempTransfer,
    void,
    { rejectValue: string }
>(
    'tempTransfer/load',
    async (_, { rejectWithValue }) => {
        try {
            const tempTransfer = await getTempTransferAPI();
            logDebug("tempTransferThunks -> loadTempTransfer -> temp:", tempTransfer);
            return tempTransfer;
        } catch (error: unknown) {
            logError("tempTransferThunks -> loadTempTransfer -> Failed", error instanceof Error ? error.message : "Unknown error");
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue('Failed to load active transfer session.');
        }
    }
);

export const createTempTransfer = createAsyncThunk<
    ITempTransfer,
    Pick<ITempTransfer, "fromLocation" | "toLocation">, 
    { rejectValue: string }
>(
    'tempTransfer/create',
    async (transferData, { rejectWithValue }) => {
        try {
            return await createTempTransferAPI(transferData);
        } catch (error: unknown) {
            logError("tempTransferThunks -> createTempTransfer -> Failed", error instanceof Error ? error.message : "Unknown error");
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue('Failed to initialize transfer session.');
        }
    }
);

export const addItem = createAsyncThunk<
    TempTransferActionResponse,
    { item: string; quantity: number; sourceLocationId: string;}, 
    { rejectValue: string }
>(
    'tempTransfer/addItem',
    async (itemData, { rejectWithValue }) => {
        try {
            const thunkResponse = await addItemAPI(itemData);
            logDebug("tempTransferThunks -> addItem -> thunkResponse:", thunkResponse);
            return thunkResponse;
        } catch (error: unknown) {
            logError("tempTransferThunks -> addItem -> Failed", error instanceof Error ? error.message : "Unknown error");
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue('Failed to add item to transfer.');
        }
    }
);

export const removeItem = createAsyncThunk<
    TempTransferActionResponse,
    string, // Just passing the itemId as a string
    { rejectValue: string }
>(
    'tempTransfer/removeItem',
    async (itemId, { rejectWithValue }) => {
        try {
            return await removeItemAPI(itemId);
        } catch (error: unknown) {
            logError("tempTransferThunks -> removeItem -> Failed", error instanceof Error ? error.message : "Unknown error");
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue('Failed to remove item from transfer.');
        }
    }
);

export const finalizeTransfer = createAsyncThunk<
    ITransfer, // Returns the finalized, permanent Transfer object
    void,
    { rejectValue: string }
>(
    'tempTransfer/finalize',
    async (_, { rejectWithValue }) => {
        try {
            return await finalizeTempTransferAPI();
        } catch (error: unknown) {
            logError("tempTransferThunks -> finalizeTransfer -> Failed", error instanceof Error ? error.message : "Unknown error");
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue('Failed to finalize transfer.');
        }
    }
);