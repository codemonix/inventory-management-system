import api from "../api/api";
import { logError } from "../utils/logger";
import { AuthResponse, MeResponse } from "../types/auth.types";


export const loginApi = async ( email: string, password: string ): Promise<AuthResponse> => {
    try {
        const res = await api.post<AuthResponse>("/auth/login", { email, password });
        return res.data; // { token, user }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logError("loginApi:", message);
        throw error;
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
