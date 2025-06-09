import { createSlice } from "@reduxjs/toolkit";
import { getDashboardData } from "../thunks/dashboardThunks.js";

const initialState = {
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
        setPage( state, action ) {
            state.page = action.payload;
        },
        setLimit( state, action ) {
            state.limit = action.payload;
        },
        setSort( state, action ) {
            state.sort = action.payload;
        },
        setSearch( state, action ) {
            state.search = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getDashboardData.pending, ( state ) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardData.fulfilled, ( state, action ) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.pagination.totalCount;
            })
            .addCase(getDashboardData.rejected, ( state, action ) => {
                state.loading = false;
                state.error = action.payload
            });
    },
});

export const { setPage, setLimit, setSort, setSearch } = dashboardSlice.actions;

export default dashboardSlice.reducer;