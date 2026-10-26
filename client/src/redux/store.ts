import { configureStore } from '@reduxjs/toolkit';
import transferReducer from './slices/transferSlice';
import locationsReducer from './slices/locationsSlice';
import itemsReducer from './slices/itemsSlice';
import dashboardReducer from './slices/dashboardSlice'


const store = configureStore({
    reducer: {
        transfer: transferReducer,
        locations: locationsReducer,
        items: itemsReducer,
        dashboard: dashboardReducer,
    },

    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false, 
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;