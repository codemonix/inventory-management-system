import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getLocations } from '../../services/locationService';
import { logDebug, logError } from '../../utils/logger';
import { ILocation } from '../../types/location.types';
import { getErrorMessage } from '../../utils/errorMessage';

interface LocationsState {
    locations: ILocation[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

export const fetchLocations = createAsyncThunk<
    ILocation[],
    void,
    { rejectValue: string; state: { locations: LocationsState } }>(
    'locations/fetchLocations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getLocations();
            logDebug("fetchLocations response: ", response);
            return response;
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to fetch locations");
            logError("fetchLocations error: ", message);
            return rejectWithValue(message);
        }
    },
    // Several screens ask for locations at once; only one request is sent
    { condition: (_, { getState }) => getState().locations.status !== 'loading' },
);

const initialState: LocationsState = {
    locations: [],
    status: 'idle',
    error: null,
};


const locationsSlice = createSlice({
    name: 'locations',
    initialState,
    reducers: {
        // Keep every screen in sync after edits on the Locations page
        locationAdded: (state, action: PayloadAction<ILocation>) => {
            state.locations.push(action.payload);
        },
        locationUpdated: (state, action: PayloadAction<ILocation>) => {
            state.locations = state.locations.map((loc) => loc._id === action.payload._id ? action.payload : loc);
        },
        locationRemoved: (state, action: PayloadAction<string>) => {
            state.locations = state.locations.filter((loc) => loc._id !== action.payload);
        },
    },
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

export const { locationAdded, locationUpdated, locationRemoved } = locationsSlice.actions;
export default locationsSlice.reducer;