import { createAsyncThunk } from "@reduxjs/toolkit";
import { getLogs } from "../../services/transactionServices";

export const fetchLogs = createAsyncThunk(
    'logs/fetchLogs',
    async ( params, thunkAPI ) => {
        console.log("fetchLogs Thunk params: -> ", params)
        try {
            const response = await getLogs(params);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Error loading logs');
        }
    }
);
