import axios from "axios";
import { getToken } from "../utils/auth.js";

const backendUrl = window?.RUNTIME_CONFIG?.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

const API = `${backendUrl}/api` || "http://localhost:5000/api";

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


