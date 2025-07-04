import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchInventory } from "../../services/inventoryServices.js";


export const getDashboardData = createAsyncThunk(
    'dashboard/getDashboardData',
    async ( params, thunkAPI ) => {
        try {
            const response = await fetchInventory(params);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Error loading dashboard');
        }
    }
);