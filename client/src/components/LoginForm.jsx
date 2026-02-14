import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { logError } from "../utils/logger.js";



function LoginForm () {
    const { login } = useContext(AuthContext); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null); 

    const isDemo = window.env?.IS_DEMO || import.meta.env.VITE_IS_DEMO === 'true';

    console.log("LoginForm.jsx -> isDemo:", isDemo)

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await login(email, password); 
            // navigate("/dashboard"); // Redirect to dashboard after successful login
        } catch (error) {
            logError("Login error:", error.message);
            const errorMessage = error.response?.data?.message || error.message;

            setError(errorMessage)

        }
    };

    const fillDemoCredentials = () => {
        setEmail("demo@ims.com");
        setPassword("demo123");
    }

    return (
        <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4">
            {isDemo && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" >
                    <button
                        type="button"
                        onClick={fillDemoCredentials}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm transition-colors"
                    >
                        Auto-Fill Demo Account
                    </button>
                </div>
            )}
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
