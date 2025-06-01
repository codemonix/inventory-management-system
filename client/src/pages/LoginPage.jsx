
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import LoginForm from "../components/LoginForm.jsx";

const LoginPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    },[user, navigate])

    return (

        <>
            {!user && (

                <div className="max-w-md mx-auto p-4">
                    <div className="w-full max-w-md p-6 border rounded-lg shadow-lg bg-white">
                        <h2 className="text-3xl font-bold text-center mb-4">Welcome to inventory management system</h2>
                        <h3 className="text-2xl font-semibold text-center mb-6">Login</h3>

                        {/* {error && <p className="text-red-500 text-sm text-center">{error}</p>} */}

                        <LoginForm />
                    </div>
                </div>
            )

            }
        </>
    );
};

export default LoginPage;