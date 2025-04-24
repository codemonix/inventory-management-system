import axios from "axios";
import { getToken } from "../utils/auth.js";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async ( email, password ) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data; // { token, user }
};

export const register = async ( email, password ) => {
    const res = await api.post("/auth/register", { email, password });
    return res.data; // { token, user }
};

export const fetchItems = async () => {
    const res = await api.get("/items");
    return res.data; // { items: [...] }
};

export default api;
