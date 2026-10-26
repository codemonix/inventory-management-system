import { useState  } from "react";
import {  Link as RouterLink } from 'react-router-dom';
import { Typography, Alert, Link } from '@mui/material';
import RegisterForm from "../components/RegisterForm";
import AuthCard from "../components/AuthCard";


const RegisterPage = () => {
    const [ error, setError ] = useState<string | null>(null)
    const [ pending, setPending ] = useState(false)
    
    return (
        <AuthCard>
            <Typography variant="body2" component="span">Welcome to Inventory System</Typography>
            <Typography variant="h5" mb={2} >Register Form</Typography>
            { error && <Alert severity="error">{error}</Alert>}
            { pending ? (
                <Alert severity="success">
                    Your account was created. An administrator must approve it before you can log in.
                </Alert>
            ) : (
                <RegisterForm
                    onError={(errorMsg) => setError(errorMsg)}
                    onPendingApproval={() => { setError(null); setPending(true); }}
                />
            )}
            <Typography variant="body2" mt={2}>
                Already have an account? <Link component={RouterLink} to="/login">Login here</Link>
            </Typography>
        </AuthCard>
    );

};

export default RegisterPage;