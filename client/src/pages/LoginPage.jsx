
import { useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Typography, Link, Box } from "@mui/material";

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
                <Box maxWidth='400px' mx='auto' mt={10} bgcolor="white" p={4} borderRadius={4}>
                    <Typography variant="body2" component='span'>Welcome to Inventory System</Typography>
                    <Typography variant="h6" mb={2} >Please Login</Typography>
                    <LoginForm />
                    <Typography variant="body2" mt={2}>
                        Don’t have an account? 
                        <Link component={RouterLink} to="/register"> Register</Link>
                    </Typography>
                </Box>

                
            )}
        </>
    );
};

export default LoginPage;