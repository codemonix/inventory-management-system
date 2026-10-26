import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { loginApi, fetchUserData, registerApi } from "../services/authService";
import { logDebug, logError, logInfo } from "../utils/logger";
import { IUser } from "../types/auth.types";

interface AuthProviderProps {
    children: ReactNode;
}



export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token;                      // Check if token exists to set initial logged-in state
    });
    const [ user, setUser ] = useState<IUser | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ isAdmin, setIsAdmin ] = useState(false);
    const [ isManager, setIsManager ] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserData()
                .then((userData) => {
                    if (cancelled) return;
                    setUser(userData.user);      // Set user data in state
                    const isAdmin = userData?.user.role === "admin";        // Check if user is admin based on role
                    const isManager = userData?.user.role === "manager";    // Check if user is manager based on role
                    setIsAdmin(isAdmin);
                    setIsManager(isManager);
                    setIsLoggedIn(true);
                    logDebug("User data fetched successfully", userData);

                })
                .catch((error) => {
                    if (cancelled) return;
                    const message = error instanceof Error ? error.message : "Unknown error";
                    logError('AuthProvider -> Invalid token or fetch user data failed:', message);
                    setIsLoggedIn(false);
                    setUser(null);
                    setIsAdmin(false);
                    setIsManager(false);
                })
                .finally(() => {
                    if (!cancelled) setLoading(false);
                });
        } else {
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, []); 


    const login = async (email: string, password: string): Promise<void> => {
        try {
            const res = await loginApi(email, password);
            logInfo("login res.user:", res.user)
            if (res && res.token) {
                localStorage.setItem("token", res.token); 
                const userData = res.user;      // Fetch user data using the token
                setUser(userData);              // Set user data in state
                const isAdmin = userData.role === 'admin';
                const isManager = userData.role === 'manager';
                setIsLoggedIn(true);
                setIsAdmin(isAdmin);
                setIsManager(isManager);
                
            }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logError("AuthProvider -> Login failed:", message);
        throw error;
    }
    };
    const logout = (): void => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        setIsAdmin(false);
        setIsManager(false);
        logInfo("User logged out");
    };

    const register = async ({ name = '', email, password }: { name?: string, email: string, password: string }): Promise<boolean> => {
        try {
            const { token, user } = await registerApi(name, email, password);

            logDebug("register -> user:", user.email)
            logDebug("register -> token", !!token)
            logDebug("is user approved?", user.isApproved)

            // No token means the account must be approved by an admin or manager first
            if (user.isApproved && token) {
                localStorage.setItem('token', token);
                setUser(user);
                setIsAdmin(user.role === 'admin');
                setIsManager(user.role === 'manager');
                setIsLoggedIn(true);
            }
            logInfo("User registered successfully");
            return Boolean(user.isApproved && token);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            logError("Register failed:", message);
            throw error;
        }
    }

    logDebug("AuthProvider -> isadmin", isAdmin);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, register, isAdmin, isManager, loading }}>
            {children}
        </AuthContext.Provider>
    );

};