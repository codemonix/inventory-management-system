
import api, { isApiError } from "../api/api";
import { logInfo, logError } from "../utils/logger";
import { IUser } from "../types/auth.types";
import { GetUsersResponse, UserResponse } from "../types/user.types";


export const getUsers = async (): Promise<IUser[]> => {
    try {
        const response = await api.get<GetUsersResponse>('/users');
        logInfo("userService.js -> getUsers -> fetched successfully");
        return response.data.users;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to fetch users API:", error.message);
            throw new Error(backendMessage || "Failed to fetch users.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in getUsers:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while fetching users.");
    }
    
}

export const updateUser = async ( id: string, data: Partial<IUser>): Promise<UserResponse> => {
    try {
        const response = await api.put(`/users/${id}`, data);
        logInfo(`userService -> updateUser for ${id} successful.`);
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to update user API:", error.message);
            throw new Error(backendMessage || "Failed to update user.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in updateUser:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while updating the user.");
    }
};

export const toggleUserActiveStatus = async ( id: string, isActive: boolean ): Promise<UserResponse> => {

    try {
        const response = await api.patch(`/users/${id}/toggle-active`, { isActive });
        logInfo("userService.js -> toggleUserActiveStatus -> id:", id, isActive);
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to toggle active status API:", error.message);
            throw new Error(backendMessage || "Failed to update user active status.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in toggleUserActiveStatus:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while updating user status.");
    }
} 

export const toggleUserApprovedStatus = async ( id: string, isApproved: boolean ) => {
    try {
        const resposne = await api.patch(`/users/${id}/toggle-approved`, { isApproved});
        logInfo("userService.js -> toggleUserApprovedStatus -> id:", id, isApproved);
        return resposne.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = error.response?.data?.message;
            logError("Failed to toggle approved status API:", error.message);
            throw new Error(backendMessage || "Failed to update user approval status.");
        }
        if (error instanceof Error) {
            logError("Standard JS Error in toggleUserApprovedStatus:", error.message);
            throw error;
        }
        throw new Error("An unknown error occurred while approving the user.");
    }

} 