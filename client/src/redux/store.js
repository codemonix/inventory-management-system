import { configureStore } from '@reduxjs/toolkit';
import transferReducer from './slices/transferSlice.js';
import locationsReducer from './slices/locationsSlice.js';
import itemsReducer from './slices/itemsSlice.js';
import dashboardReducer from './slices/dashboardSlice.js'
import usersReducer from './slices/usersSlice.js';
import transactionReducer from './slices/transactionLogSlice.js'

const store = configureStore({
    reducer: {
        transfer: transferReducer,
        locations: locationsReducer,
        items: itemsReducer,
        dashboard: dashboardReducer,
        users: usersReducer,
        transactions: transactionReducer,
    },
});

export default store;