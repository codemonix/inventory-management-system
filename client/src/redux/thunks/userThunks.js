import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, toggleUserActiveStatus, toggleUserApprovedStatus, updateUser } from "../../services/userService";
import { logError, logInfo } from "../../utils/logger";

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async ( params, thunkAPI ) => {
        try {
            const users = await getUsers(params);
            logInfo("Thunk users:", users)
            return users;
        } catch (error) {
            logError("userThunks:", error.message)
            return thunkAPI.rejectWithValue( error.message || "Error fetching users!")
        }
    });

export const updateUserDetails = createAsyncThunk(
    'users/updateUserDetails',
    async ( { id, ...data }) => {
        logInfo("thunk data:", data)
        const updatedUser = await updateUser( id, data );
        return updatedUser;
    });

export const toggleUserActive = createAsyncThunk(
    'user/toggleUserActive',
    async ({ id, isActive }) => {
        const data = await toggleUserActiveStatus( id, isActive );
        return data;
    });

export const toggleUserApproved = createAsyncThunk(
    'user/toggleUserApproved',
    async ({ id, isApproved }) => {
        const data = await toggleUserApprovedStatus( id, isApproved );
        return data;
    }
);