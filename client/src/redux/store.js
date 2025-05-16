import { configureStore } from '@reduxjs/toolkit';
import transferReducer from './slices/transferSlice.js';
import locationsReducer from './slices/locationsSlice.js';
import itemsReducer from './slices/itemsSlice.js';

const store = configureStore({
    reducer: {
        transfer: transferReducer,
        locations: locationsReducer,
        items: itemsReducer,
    },
});

export default store;