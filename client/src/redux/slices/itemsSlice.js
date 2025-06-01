import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItems } from "../../services/itemsService.js";
import { logInfo } from "../../utils/logger.js";

export const loadItems = createAsyncThunk(
    'items/loadItems',
    async () => {
        const response = await getItems();
        logInfo("loadItems response: ", response);
        return response;
    });
    
const itemsSlice = createSlice({
    name: 'items',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(loadItems.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadItems.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(loadItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default itemsSlice.reducer;