import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, toggleUserActiveStatus, toggleUserApprovedStatus, updateUser } from "../../services/userServices";
import { logError, logInfo } from "../../utils/logger";

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async ( params, thunkAPI ) => {
        try {
            const res = await getUsers(params);
            logInfo("Thunk users:", res.data)
            return res.data;
        } catch (error) {
            logError("userThunks:", error.message)
            return thunkAPI.rejectWithValue( error.message || "Error fetching users!")
        }
    });

export const updateUserDetails = createAsyncThunk(
    'users/updateUserDetails',
    async ( { id, ...data }) => {
        const res = await updateUser( id, data );
        return res.data;
    });

export const toggleUserActive = createAsyncThunk(
    'user/toggleUserActive',
    async ({ id, isActive }) => {
        const res = await toggleUserActiveStatus( id, isActive );
        return res.data;
    });

export const toggleUserApproved = createAsyncThunk(
    'user/toggleUserApproved',
    async ({ id, isApproved }) => {
        const res = await toggleUserApprovedStatus( id, isApproved );
        return res.data;
    }
);