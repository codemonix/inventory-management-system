import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { loginApi, fetchUserData, registerApi } from "../services/authServices.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";


export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token;                      // Check if token exists to set initial logged-in state
    });
    const [ user, setUser ] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [ loading, setLoading ] = useState(true);
    const [ isAdmin, setIsAdmin ] = useState(false);
    const [ isManager, setIsManager ] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserData(token)
                .then((userData) => {
                    setUser(userData);      // Set user data in state
                    const isAdmin = userData?.user.role === "admin";        // Check if user is admin based on role
                    const isManager = userData?.user.role === "manager";    // Check if user is manager based on role
                    setIsAdmin(isAdmin);
                    setIsManager(isManager);
                    setIsLoggedIn(true);
                    logDebug("User data fetched successfully userData, user", userData, user);

                })
                .catch((error) => {
                    console.error('Invalid token or fetch user data failed:', error.message);
                    setIsLoggedIn(false);
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                }); 
        } else {
            setLoading(false);
        }

    }, []); 



    const login = async (email, password) => {
        try {
            const res = await loginApi(email, password);
            logInfo("loing res.user:", res.user)
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
        logError("Login failed:", error.message);
        throw error;
    }
    };
    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
    };

    const register = async ({name, email, password} ) => {
        try {
            const { token, user } = await registerApi(name, email, password);
            logInfo("register -> user:", user)
            logInfo("register -> token", token)
            logInfo("is user approved?", user.isApproved)
            if (user.isApproved) {
                localStorage.setItem('token', token);
                setUser(user);
                setIsAdmin(user.role === 'admin');
                setIsManager(user.role === 'manager');
                setIsLoggedIn(true);
            }
        } catch (error) {
            logError("Register failed:", error.message);
            throw error;
        }
    }

    console.log("AuthProvider -> isadmin", isAdmin);
    console.log("AuthProvider -> isAdmin", user?.role);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, register, isAdmin, isManager }}>
            {children}
        </AuthContext.Provider>
    );

};