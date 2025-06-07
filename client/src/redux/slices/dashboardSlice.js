import { createSlice } from "@reduxjs/toolkit";
import { getDashboardData } from "../thunks/dashboardThunks";

const initialState = {
    items: [],
    totalItems: 0,
    page: 1,
    limit: 10,
    sort: 'name',
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
                state.totalItems = action.payload.totalCount;
            })
            .addCase(getDashboardData.rejected, ( state, action ) => {
                state.loading = false;
                state.error = action.payload
            });
    },
});

export const { setPage, setLimit, setSort } = dashboardSlice.actions;

export default dashboardSlice.reducer;