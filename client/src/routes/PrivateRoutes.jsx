import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


const PrivateRoutes = () => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) {
        // If not authenticated, redirect to the login page
        return <Navigate to="/login" />;
    };
    console.log("PrivateRoutes -> isLoggedIn", isLoggedIn);
    return <Outlet />; // Render the child routes if authenticated
};

export default PrivateRoutes;