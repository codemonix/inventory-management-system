import { useEffect, useState } from "react";
import { Form, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Box,
    Alert,
} from '@mui/material';

import api from "../../api/api";
import { logInfo } from "../../utils/logger";

export default function SetupPage() {
    const [ needSetup, setNeedSetup ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ formData, setFormData ] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [ error, setError ] = useState('');
    const [ success, setSuccess ] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/setup')
            .then(res => {
                logInfo(res);
                setNeedSetup(res.data.needSetup);
                setLoading(false);
            });
    },[]);

    useEffect(() => {
        if (loading) return;
        if (!needSetup) {
            navigate('/login');
        } 
    },[needSetup, navigate, loading])

    logInfo("Setup page, needSetup:", needSetup)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            await api.post( '/setup', formData );
            setSuccess('Admin account created. Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create admin account.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
                <p>Checking setup status...</p>
            </Box>
        );
    }

    if (!needSetup) {
        // navigate('/login');
        return null
    }


    return (
        <Container maxWidth="sm" sx={{ mt: 6, bgcolor: 'white', borderRadius: 4, p: 2 }} >
            <Typography variant="h4" gutterBottom >
                Initial Setup
            </Typography>
            <Typography variant="body1" gutterBottom >
                No user found. Please create first admin account.
            </Typography>
            { error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> }
            { success && <Alert severity="success" sx={{ mb: 2 }} >{success}</Alert> }
            <form onSubmit={handleSubmit}>
                <TextField 
                    label="Name"
                    name="name"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField 
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.email}
                    onChange={handleChange}
                />
                <TextField 
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.password}
                    onChange={handleChange}
                />
                <TextField 
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Create Admin
                </Button>
            </form>
        </Container>
    )
}