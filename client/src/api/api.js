import axios from "axios";
import { getToken } from "../utils/auth.js";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    console.log("Token:", localStorage.getItem('token')); // Log the token to check if it's being retrieved correctly
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginApi = async ( email, password ) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data; // { token, user }
};

export const register = async ( email, password ) => {
    const res = await api.post("/auth/register", { email, password });
    return res.data; // { token, user }
};


export const fetchInventory = async () => {
    const res = await api.get("/inventory");
    console.log("Inventory Data:", res.data); // Log the inventory data to check if it's being retrieved correctly
    return res.data; // { items: [...] }
};

export const fetchUserData = async () => {
    const res = await api.get("/auth/me");
    return res.data; // { user: { id, name, email, role } }
}

export default api;
