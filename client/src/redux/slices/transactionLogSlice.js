import { createSlice } from "@reduxjs/toolkit";
import { fetchLogs } from "../thunks/transactionThunks";

const transactionLogSlice = createSlice({
    name: 'transactionLogs',
    initialState: {
        items: [],
        total: 0,
        skip: 0,
        hasMore: true,
        loading: false,
        error: null,
    },
    reducers: {
        resetLogs(state) {
            state.items = [];
            state.skip = 0;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLogs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                const { logs, total } = action.payload;
                state.items.push(...logs);
                state.total = total;
                state.skip += logs.length;
                state.hasMore = state.skip < total;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload
            })
    }
});

export const { resetLogs } = transactionLogSlice.actions;
export default transactionLogSlice.reducer;

