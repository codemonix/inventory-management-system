import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logInfo } from "../utils/logger";


const LogoutPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        logout();
        navigate("/login", { replace: true }); // Redirect to login page after logout
    }, [navigate, logout]);

    logInfo("Logged out successfully");
    return null;
};

export default LogoutPage;