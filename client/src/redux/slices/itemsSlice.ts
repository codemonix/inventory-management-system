import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAllItems, getPaginatedItems } from "../../services/itemService"; // Adjust extension if needed
import { logInfo, logDebug, logError } from "../../utils/logger";
import { IItem } from "../../types/item.types";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
// Adjust this interface to match exactly what your backend Item model looks like
export interface IItemDefinition {
    _id: string;
    name: string;
    code: string;
    price?: number;
    imageUrl?: string;
    category?: string;
}

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

export interface AllItemsResponse {
    items: IItemDefinition[];
}

interface ItemsState {
    fullList: IItemDefinition[];
    list: IItemDefinition[];
    statusFull: 'idle' | 'loading' | 'succeeded' | 'failed';
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
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to load items";
            logError("Rejected loadItems with:", message);
            return rejectWithValue(message);
        }
    }
);

export const loadAllItems = createAsyncThunk<
    AllItemsResponse,       // Expected success payload
    void,                   // No arguments passed
    { rejectValue: string } // Expected error type
>(
    'items/loadAllItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllItems();
            logInfo("loadAllItems response: ", response);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to load all items");
        }
    }
);

// ==========================================
// 3. SLICE & STATE
// ==========================================
const initialState: ItemsState = {
    fullList: [],
    list: [],
    statusFull: 'idle',
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
            state.page = 1; // 👈 Pagination Trap Fix
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
            state.page = 1; // 👈 Pagination Trap Fix
        },
        setSort: (state, action: PayloadAction<string>) => {
            state.sort = action.payload;
            state.page = 1; // 👈 Pagination Trap Fix
        },
        updateItemImageLocal: (state, action: PayloadAction<{ itemId: string; imageUrl: string }>) => {
            const { itemId, imageUrl } = action.payload;
            logDebug("itemsSlice -> updateItemImageLocal -> itemId:", itemId);
            
            const existingItem = state.list.find((item) => item._id === itemId);
            if (existingItem) {
                existingItem.imageUrl = imageUrl;
            }

            // Pro-Tip: You might also want to update the fullList if it's currently loaded!
            const existingFullItem = state.fullList.find((item) => item._id === itemId);
            if (existingFullItem) {
                existingFullItem.imageUrl = imageUrl;
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
            .addCase(loadItems.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || "An unknown error occurred.";
            });

        // --- All Items ---
        builder
            .addCase(loadAllItems.pending, (state) => {
                state.statusFull = 'loading';
                state.error = null;
            })
            .addCase(loadAllItems.fulfilled, (state, action: PayloadAction<AllItemsResponse>) => {
                state.statusFull = 'succeeded';
                state.fullList = action.payload.items;
            })
            .addCase(loadAllItems.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.statusFull = 'failed';
                // Note: The original code used action.error.message here, but because we use
                // rejectWithValue in the Thunk, action.payload is the safer typed bet.
                state.error = action.payload || "Failed to load full list.";
            });
    }
});

export const { setPage, setLimit, setSearch, setSort, updateItemImageLocal } = itemsSlice.actions;
export default itemsSlice.reducer;