import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllItems, getPaginatedItems } from "../../services/itemsService.js";
import { logInfo } from "../../utils/logger.js";

export const loadItems = createAsyncThunk(
    'items/loadItems',
    async ({ page, limit, search, sort }, { rejectWithValue }) => {
        try {
            const data = await getPaginatedItems({ page, limit, search, sort });
            logInfo("loadPaginatedItems response: ", data);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.error("Rejected loadItems with:", message);
            return rejectWithValue(error.response?.data?.message || error.message)
        }
    });

export const loadAllItems = createAsyncThunk(
    'items/loadAllItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllItems();
            logInfo("loadAllItems response: ", response);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const initialState = {
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
}
    
const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers:{
        setPage: ( state, action ) => {
            state.page = action.payload;
        },
        setLimit: ( state, action ) => {
            state.limit = action.payload;
        },
        setSearch: ( state, action ) => {
            state.search = action.payload;
        },
        setSort: ( state, action ) => {
            state.sort = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadItems.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadItems.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload.items;
                state.totalCount = action.payload.totalCount;
                // state.items = action.payload;
            })
            .addCase(loadItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            .addCase(loadAllItems.pending, (state) => {
                state.statusFull = 'loading';
                state.error = null;
            })
            .addCase(loadAllItems.fulfilled, (state, action) => {
                state.statusFull = 'succeeded';
                state.fullList = action.payload.items;
            })
            .addCase(loadAllItems.rejected, (state, action) => {
                state.statusFull = 'failed';
                state.error = action.error.message;
            });
    }
});

export const { setPage, setLimit, setSearch, setSort } = itemsSlice.actions;
export default itemsSlice.reducer;