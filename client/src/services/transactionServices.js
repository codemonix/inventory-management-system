import api from "../api/api";
import { logInfo } from "../utils/logger";

export const getLogs = async ({ search = '', sortBy = 'createdAt', sortOrder = 'desc', skip = 0, limit = 20 }) => {
    const response = await api.get(`/transactions/logs?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&skip=${skip}&limit=${limit}`);
    logInfo('Get logs:', response);
    return response.data;
}