import axios from "axios";
import { getToken } from "../utils/auth.js";
import { logDebug } from "../utils/logger.js";
import { getApiBaseUrl } from "../config.js";
// import config from "../config.js";

// const backendUrl = import.meta.env.VITE_API_BASE_URL;
// logInfo("backendUrl:", backendUrl);
// const API = `${backendUrl}` || "http://localhost:5000/api";

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


