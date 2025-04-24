import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm.jsx";
import { login } from "../api/api.js";
import { setToken } from "../utils/auth.js";

const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleLogin = async (email, password) => {
        try {
            const data = await login( email, password);
            // localStorage.setItem("token", data.token); // Store token in local storage
            setToken(data.token); // Store token using the utility function
            navigate("/dashboard"); // Redirect to dashboard after successful login
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="w-full max-w-md p-6 border rounded-lg shadow-lg bg-white">
                <h2 className="text-3xl font-bold text-center mb-4">Welcome to inventory management system</h2>
                <h3 className="text-2xl font-semibold text-center mb-6">Login to Your Account</h3>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <LoginForm onLogin={handleLogin}/>
            </div>
        </div>
    );
};

export default LoginPage;