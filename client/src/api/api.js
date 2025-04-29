import axios from "axios";
import { getToken } from "../utils/auth.js";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    console.log("api.js -> Token:", localStorage.getItem('token')); // Log the token to check if it's being retrieved correctly
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;


