import axios from "axios";
import { getToken } from "../utils/auth.js";
import { logDebug, logInfo } from "../utils/logger.js";
import config from "../config.js";

// const backendUrl = import.meta.env.VITE_API_BASE_URL;
// logInfo("backendUrl:", backendUrl);
// const API = `${backendUrl}` || "http://localhost:5000/api";
const BACKEN_API_URL = config.API_URL || "http://localhost:5000/api";
logDebug("config itself:", config)
const api = axios.create({
    baseURL: config.BACKEN_API_URL,
});

api.interceptors.request.use((config) => {
    logInfo("actual URL:", BACKEN_API_URL);
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;


