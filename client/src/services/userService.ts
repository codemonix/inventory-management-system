
import api, { isApiError } from "../api/api";
import { getBackendMessage } from "../utils/backendMessage";
import { logInfo, logError } from "../utils/logger";
import { GetUsersResponse, UserResponse, UserUpdate } from "../types/user.types";

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
}

// One page of users (managers and admins only)
export const getUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    try {
        const response = await api.get<GetUsersResponse>('/users', { params: { ...params, search: params.search || undefined } });
        logInfo("userService -> getUsers -> fetched successfully");
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
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

export const updateUser = async ( id: string, data: UserUpdate): Promise<UserResponse> => {
    try {
        const response = await api.put<UserResponse>(`/users/${id}`, data);
        logInfo(`userService -> updateUser for ${id} successful.`);
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
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
        const response = await api.patch<UserResponse>(`/users/${id}/toggle-active`, { isActive });
        logInfo("userService -> toggleUserActiveStatus -> id:", id, isActive);
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
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

export const toggleUserApprovedStatus = async ( id: string, isApproved: boolean ): Promise<UserResponse> => {
    try {
        const response = await api.patch<UserResponse>(`/users/${id}/toggle-approved`, { isApproved});
        logInfo("userService -> toggleUserApprovedStatus -> id:", id, isApproved);
        return response.data;
    } catch (error) {
        if (isApiError(error)) {
            const backendMessage = getBackendMessage(error);
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