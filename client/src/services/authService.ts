import api from "../api/api.js";
import { logError } from "../utils/logger.js";
import { AuthResponse, MeResponse } from "../types/auth.types.js";


export const loginApi = async ( email: string, password: string ): Promise<AuthResponse> => {
    try {
        const res = await api.post<AuthResponse>("/auth/login", { email, password });
        return res.data; // { token, user }
    } catch (error: any) {
        logError("loginApi:", error.message)
        throw error
    }
    
    
};

export const registerApi = async ( name="", email: string, password: string ): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
    return res.data; // { token, user }
};


export const fetchUserData = async (): Promise<MeResponse> => {
    const res = await api.get("/auth/me");
    return res.data; // { user: { id, name, email, role } }
}
