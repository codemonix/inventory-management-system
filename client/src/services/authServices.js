import api from "../api/api.js";
import { logError } from "../utils/logger.js";


export const loginApi = async ( email, password ) => {
    try {
        const res = await api.post("/auth/login", { email, password });
        return res.data; // { token, user }
    } catch (error) {
        logError("loginApi:", error)
        throw error
    }
    
    
};

export const register = async ( email, password ) => {
    const res = await api.post("/auth/register", { email, password });
    return res.data; // { token, user }
};


export const fetchUserData = async () => {
    const res = await api.get("/auth/me");
    return res.data; // { user: { id, name, email, role } }
}
