import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { loginApi, fetchUserData } from "../services/authServices.js";


export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token; // Check if token exists to set initial logged-in state
    });
    const [ user, setUser ] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [ loading, setLoading ] = useState(true);
    

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("AuthProvider Token:", token); // Log the token to check if it's being retrieved correctly
        if (token) {
            fetchUserData(token)
                .then((userData) => {
                    setUser(userData);
                    setIsLoggedIn(true);
            
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
            if (res && res.token) {
                console.log("AuthContext Token:", res.token); // Log the token to check if it's being retrieved correctly
                localStorage.setItem("token", res.token); // Store token in local storage
                const userData = await fetchUserData(res.token); // Fetch user data using the token
                setUser(userData); // Set user data in state
                setIsLoggedIn(true);
            }
    } catch (error) {
        console.error("Login failed:", error.message);
    }
    };
    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

};