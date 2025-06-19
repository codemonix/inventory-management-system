import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { loginApi, fetchUserData } from "../services/authServices.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";


export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token; // Check if token exists to set initial logged-in state
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
                    setUser(userData); // Set user data in state
                    const isAdmin = userData?.user.role === "admin"; // Check if user is admin based on role
                    const isManager = userData?.user.role === "manager"; // Check if user is manager based on role
                    setIsAdmin(isAdmin);
                    setIsManager(isManager);
                    setIsLoggedIn(true);
                    logDebug("User data fetched successfully userData, user", userData, user); // Log user data to check if it's being retrieved correctly

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

    }, []); // Run this effect only once when the component mounts



    const login = async (email, password) => {
        try {
            const res = await loginApi(email, password);
            logInfo("loing res.user:", res.user)
            if (res && res.token) {
                // logDebug("AuthContext response:", res); // Log the token to check if it's being retrieved correctly
                localStorage.setItem("token", res.token); // Store token in local storage
                const userData = res.user; // Fetch user data using the token
                setUser(userData); // Set user data in state
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

    console.log("AuthProvider -> isadmin", isAdmin);
    console.log("AuthProvider -> isAdmin", user?.role);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isAdmin, isManager }}>
            {children}
        </AuthContext.Provider>
    );

};