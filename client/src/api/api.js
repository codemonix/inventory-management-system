import axios from "axios";
import { getToken } from "../utils/auth.js";
import { logDebug } from "../utils/logger.js";
import { getApiBaseUrl } from "../config.js";

const api = axios.create();

api.interceptors.request.use((config) => {
    const baseUrl = getApiBaseUrl();
    logDebug("base URL:", baseUrl)
    config.baseURL = baseUrl;
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;


