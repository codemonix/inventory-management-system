import axios from "axios";
import { getToken } from "../utils/auth.js";
import { logInfo } from "../utils/logger.js";
import config from "../config.js";

// const backendUrl = import.meta.env.VITE_API_BASE_URL;
// logInfo("backendUrl:", backendUrl);
// const API = `${backendUrl}` || "http://localhost:5000/api";

const api = axios.create({
    baseURL: config.API_URL,
});

api.interceptors.request.use((config) => {
    logInfo("API_URL:", config.API_URL)
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;


