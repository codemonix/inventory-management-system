import { useState  } from "react";
import {  Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Alert, Link } from '@mui/material';
import RegisterForm from "../components/RegisterForm";



const RegisterPage = () => {
    const [ error, setError ] = useState(null)
    
    return (
        <Box maxWidth="400px" mx='auto' mt={10} bgcolor={"white"} p={4} borderRadius={4}>
            <Typography variant="body2" component="span">Welcome to Inventory System</Typography>
            <Typography variant="h5" mb={2} >Register Form</Typography>
            { error && <Alert severity="error">{error}</Alert>}
            <RegisterForm onError={(errorMsg) => setError(errorMsg)} />
            <Typography variant="body2" mt={2}>
                Already have an account? <Link component={RouterLink} to="/login">Login here</Link>
            </Typography>
        </Box>
    );

};

export default RegisterPage;