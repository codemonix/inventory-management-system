import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLocations } from '../../services/locationService.js';
import { logDebug } from '../../utils/logger.js';
import { ILocation } from '../../types/location.types.js';

interface LocationsState {
    locations: ILocation[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

export const fetchLocations = createAsyncThunk<

    ILocation[],
    void,
    { rejectValue: string }>(
    'locations/fetchLocations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getLocations();
            logDebug("fetchLocations response: ", response);
            return response;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to fetch locations";
            logError("fetchLocations error: ", message);
            return rejectWithValue(message);
        }
    }
);

const initialState: LocationsState = {
    locations: [],
    status: 'idle',
    error: null,
};


const locationsSlice = createSlice({
    name: 'locations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocations.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.locations = action.payload;
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.status = 'failed';
                logDebug("fetchLocations error: ", action.payload);
                state.error = action.payload || "Failed to fetch locations";
            });   
    },
});

export default locationsSlice.reducer;