import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, fetchUserData  } from "../api/api";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [ user, setUser ] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            fetchUserData(token).then(setUser)
        }

    }, []);

    const login = async (email, password) => {
        try {
            const res = await loginApi(email, password);
            if (res && res.token) {
                console.log("AuthContext Token:", res.token); // Log the token to check if it's being retrieved correctly
                localStorage.setItem("token", res.token); // Store token in local storage
                setIsLoggedIn(true);
                fetchUserData(res.token).then(setUser);
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
