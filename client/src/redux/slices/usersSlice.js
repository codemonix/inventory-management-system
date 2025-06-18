import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, updateUserDetails, toggleUserActive, toggleUserApproved } from '../thunks/userThunks';


const initialState = {
    users: [],
    status: 'idle',
    error: null,
    page: 1,
    limit: 20,
    search: '',
    sort: 'name_asc',
    totalCount: 0,
}


const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setPage: ( state, action ) => {
            state.page = action.payload;
        },
        setLimit: ( state, action ) => {
            state.limit = action.payload;
        },
        setSearch: ( state, action ) => {
            state.search = action.payload;
        },
        setSort: ( state, action ) => {
            state.sort = action.payload;
        }
    },
    extraReducers: ( builder ) => {
        builder
            .addCase( fetchUsers.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase( fetchUsers.fulfilled, ( state, action ) => {
                state.status = 'succeeded' ;
                state.users = action.payload.users;
                state.totalCount = action.payload.totalCount;
            })
            .addCase( fetchUsers.rejected, ( state, action ) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase( updateUserDetails.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase( updateUserDetails.fulfilled, ( state, action ) => {
                state.status = 'succeeded';
                const idx = state.users.findIndex( ( user ) => user._id === action.payload._id);
                if ( idx !== -1 ) state.users[idx] = action.payload;
            })
            .addCase( updateUserDetails.rejected, ( state, action ) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase( toggleUserActive.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase ( toggleUserActive.fulfilled, ( state, action ) => {
                state.status = 'succeeded';
                const idx = state.users.findIndex( ( user ) => user._id === action.payload._id);
                if ( idx !== -1 ) state.users[idx] = action.payload;
            })
            .addCase ( toggleUserActive.rejected, ( state, action ) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase ( toggleUserApproved.pending, ( state ) => {
                state.status = 'loading';
                state.error = null;
            } )
            .addCase ( toggleUserApproved.fulfilled, ( state, action ) => {
                state.status = 'succeeded';
                const idx = state.users.findIndex( ( user ) => user._id === action.payload._id);
                if ( idx !== -1 ) state.users[idx] = action.payload;
            })
            .addCase ( toggleUserApproved.rejected, ( state, action ) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
    }
});

export const { setPage, setLimit, setSearch, setSort} = userSlice.actions;
export default userSlice.reducer;