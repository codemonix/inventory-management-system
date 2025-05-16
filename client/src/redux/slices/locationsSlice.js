import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLocations } from '../../services/locationsService.js';
import { logDebug } from '../../utils/logger.js';

export const fetchLocations = createAsyncThunk(
    'locations/fetchLocations',
    async () => {
        const response = await getLocations();
        logDebug("fetchLocations response: ", response);
        return response;
    }
);

const locationsSlice = createSlice({
    name: 'locations',
    initialState: {
        locations: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.locations = action.payload;
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });   
    },
});

export default locationsSlice.reducer;