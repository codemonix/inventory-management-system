import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItems } from "../../services/itemsService.js";
import { logDebug } from "../../utils/logger.js";

export const loadItems = createAsyncThunk(
    'items/loadItems',
    async () => {
        const response = await getItems();
        logDebug("loadItems response: ", response);
        return response;
    });
    
const itemsSlice = createSlice({
    name: 'items',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(loadItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(loadItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default itemsSlice.reducer;