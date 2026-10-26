import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getPaginatedItems } from "../../services/itemService"; // Adjust extension if needed
import { logInfo, logDebug, logError } from "../../utils/logger";
import { IItem } from "../../types/item.types";
import { getErrorMessage } from "../../utils/errorMessage";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
export interface FetchItemsParams {
    page: number;
    limit: number;
    search: string;
    sort: string;
}

export interface PaginatedItemsResponse {
    items: IItem[];
    totalCount: number;
}

interface ItemsState {
    list: IItem[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    page: number;
    limit: number;
    search: string;
    sort: string;
    totalCount: number;
}

// ==========================================
// 2. ASYNC THUNKS
// ==========================================
export const loadItems = createAsyncThunk<
    PaginatedItemsResponse,  // Expected success payload
    FetchItemsParams,        // Arguments passed to the thunk
    { rejectValue: string }  // Expected error type
>(
    'items/loadItems',
    async (params, { rejectWithValue }) => {
        try {
            const data = await getPaginatedItems(params);
            logInfo("loadItems response: ", data);
            return data;
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to load items");
            logError("Rejected loadItems with:", message);
            return rejectWithValue(message);
        }
    }
);

// ==========================================
// 3. SLICE & STATE
// ==========================================
const initialState: ItemsState = {
    list: [],
    status: 'idle',
    error: null,
    page: 1,
    limit: 20,
    search: '',
    sort: 'name_asc',
    totalCount: 0,
};

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            logDebug("itemsSlice -> setPage -> action.payload: ", action.payload);
            state.page = action.payload;
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload;
            state.page = 1; // a new filter starts again at page 1
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
            state.page = 1; // a new filter starts again at page 1
        },
        setSort: (state, action: PayloadAction<string>) => {
            state.sort = action.payload;
            state.page = 1; // a new filter starts again at page 1
        },
        updateItemImageLocal: (state, action: PayloadAction<{ itemId: string; imageUrl: string }>) => {
            const { itemId, imageUrl } = action.payload;
            logDebug("itemsSlice -> updateItemImageLocal -> itemId:", itemId);
            
            const existingItem = state.list.find((item) => item._id === itemId);
            if (existingItem) {
                existingItem.imageUrl = imageUrl;
            }

        }
    },
    extraReducers: (builder) => {
        // --- Paginated Items ---
        builder
            .addCase(loadItems.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadItems.fulfilled, (state, action: PayloadAction<PaginatedItemsResponse>) => {
                state.status = 'succeeded';
                state.list = action.payload.items;
                state.totalCount = action.payload.totalCount;
            })
            .addCase(loadItems.rejected, (state, action) => {
                // Cancelled because a newer query replaced it: that request is now pending
                if (action.meta.aborted) return;
                state.status = 'failed';
                state.error = action.payload || "An unknown error occurred.";
            });
    }
});

export const { setPage, setLimit, setSearch, setSort, updateItemImageLocal } = itemsSlice.actions;
export default itemsSlice.reducer;