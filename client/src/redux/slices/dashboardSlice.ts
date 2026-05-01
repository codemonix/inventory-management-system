import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDashboardData } from "../thunks/dashboardThunks"; 
import { IInventoryRecord, InventoryPaginatedResult } from "../../types/inventory.types";

interface DashboardState {
    items: IInventoryRecord[];
    totalItems: number;
    page: number;
    limit: number;
    sort: string;
    search: string;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    items: [],
    totalItems: 0,
    page: 1,
    limit: 10,
    sort: 'name_asc',
    search: '',
    loading: false,
    error: null
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        setLimit(state, action: PayloadAction<number>) {
            state.limit = action.payload;
            state.page = 1; 
        },
        setSort(state, action: PayloadAction<string>) {
            state.sort = action.payload;
            state.page = 1; 
        },
        setSearch(state, action: PayloadAction<string>) {
            state.search = action.payload;
            state.page = 1; 
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardData.fulfilled, (state, action: PayloadAction<InventoryPaginatedResult>) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.pagination.totalCount;
            })
            .addCase(getDashboardData.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || "Failed to load dashboard data";
            });
    },
});

export const { setPage, setLimit, setSort, setSearch } = dashboardSlice.actions;

export default dashboardSlice.reducer;