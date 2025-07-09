import axios from "axios";
import { getToken } from "../utils/auth.js";
// import { logInfo } from '../utils/logger.js';

// const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"; // fall back to local if exist
const API = `${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}/api` || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API,
});

api.interceptors.request.use((config) => {
    console.log("API:", API)
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;


