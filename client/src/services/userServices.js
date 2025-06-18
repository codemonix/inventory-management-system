
import api from "../api/api";
// import { logInfo } from "../utils/logger";

export const getUsers = () => {
    const data = api.get('/users');
    // logInfo(data);
    return data
    
}

export const updateUser = ( id, data) => api.put(`/users/${id}`, data);

export const toggleUserActiveStatus = ( id, isActive ) => api.patch(`/user/${id}/toggle-active`, { isActive });

export const toggleUserApprovedStatus = ( id, isApproved ) => api.patch(`/user/${id}/toggle-approved`, { isApproved});