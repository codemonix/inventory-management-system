import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { logError } from "../utils/logger.js";


function LoginForm () {
    const { login } = useContext(AuthContext); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 
    const [error, setError] = useState(null); 

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await login(email, password); 
            navigate("/dashboard"); // Redirect to dashboard after successful login
        } catch (error) {
            logError("Login error:", error.message);
            setError(error.response.data.message)

        }
    };

    return (
        <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white p-2 rounded-md">Login</button>
            { error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
    );
};

export default LoginForm;
