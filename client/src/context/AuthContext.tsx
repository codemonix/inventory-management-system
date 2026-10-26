import { createContext, useContext } from "react";
import { IUser } from "../types/auth.types";

interface IAuthContext {
    isLoggedIn: boolean;
    user: IUser | null;
    loading: boolean;
    isAdmin: boolean;
    isManager: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    // Resolves true when logged in right away, false when the account awaits approval
    register: (credentials: { name?: string, email: string, password: string }) => Promise<boolean>;
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);
export const useAuth = (): IAuthContext => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
} 


