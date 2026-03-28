import axios from "axios";
import { getToken, removeToken } from "../utils/auth.js";
import { logDebug, logError } from "../utils/logger.js";
import { getApiBaseUrl } from "../config.js";

const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    logDebug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config;
    },
    (error) => {
        logError("[API Request Setup Error]", error.message);
        return Promise.reject(error);
    }
);

api.interceptors.response.use((response) => {
    return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            logError("[API Timeout]", error.message);
            // We can attach a clean message for the frontend UI to display
            error.userMessage = "The server took too long to respond. Please try again.";
        } else if (error.response?.status === 401) {
            logError("[API 401] Unauthorized. Token may be expired.");
            removeToken();
            window.location.href = "/login?reason=expired";
        } else if (error.response?.status >= 500) {
            logError("[API 500+] Server Error:", error.response?.data);;
            error.userMessage = "An internal server error occurred. Our team has been notified.";
        } else if (!error.response) {
            logError("[API Network Error]", error.message);
            error.userMessage = "Network error. Please check your internet connection.";
        }
        return Promise.reject(error);
    }
);

export default api;


