import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchInventory } from "../../services/inventoryService";
import { FetchInventoryParams, InventoryPaginatedResult } from "../../types/inventory.types.js";


export const getDashboardData = createAsyncThunk<
    InventoryPaginatedResult,
    FetchInventoryParams | void,
    { rejectValue: string }
    >(
    'dashboard/getDashboardData',
    async ( params, thunkAPI ) => {
        const queryParams = params || {};
        try {
            const response = await fetchInventory(queryParams);
            return response;
        } catch (error) {
            if (error instanceof Error) {
                return thunkAPI.rejectWithValue(error.message);
            }
            return thunkAPI.rejectWithValue('An unknown error occurred while loading the dashboard.');
        }
    }
);