import { configureStore } from '@reduxjs/toolkit';
import transferReducer from './slices/transferSlice.js';
import locationsReducer from './slices/locationsSlice.js';
import itemsReducer from './slices/itemsSlice.js';
import dashboardReducer from './slices/dashboardSlice.js'
// import usersReducer from './slices/usersSlice.js';
// import transactionReducer from './slices/transactionLogSlice.js'
// import systemReducer from './slices/systemSlice.js'
import settingReducer from './slices/settingsSlice.js'
// import systemLogReducer from './slices/systemLogSlice.js'




const store = configureStore({
    reducer: {
        transfer: transferReducer,
        locations: locationsReducer,
        items: itemsReducer,
        dashboard: dashboardReducer,
        // users: usersReducer,
        // transactions: transactionReducer,
        // system: systemReducer,
        settings: settingReducer,
        // systemLogs: systemLogReducer,
    },

    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false, 
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;