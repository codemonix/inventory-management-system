import { createAsyncThunk } from "@reduxjs/toolkit";
import { getLogs } from "../../services/transactionService";
import { logDebug } from "../../utils/logger";

export const fetchLogs = createAsyncThunk(
    'logs/fetchLogs',
    async ( params, thunkAPI ) => {
        logDebug("transactionThunks.js -> fetchLogs Thunk params: -> ", params)
        try {
            const response = await getLogs(params);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Error loading logs');
        }
    }
);
