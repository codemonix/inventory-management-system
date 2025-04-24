import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth.js";


const LogoutPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        removeToken();
        navigate("/login", { replace: true }); // Redirect to login page after logout
    }, [navigate]);

    console.log("Logged out successfully");
    return null;
};

export default LogoutPage;