import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// import { setToken } from "../utils/auth.js";
// import { login } from "../utils/api.js";



function LoginForm ( { onLogin } ) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        onLogin( email, password );
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
        </form>
    );
};

export default LoginForm;
