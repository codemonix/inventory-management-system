import { useState  } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import api from '../api/api';


const RegisterPage = () => {
    const navigate = useNavigate();
    const [ form, setForm ] = useState({ name: '', email: '', password: '' });
    const [ error, setError ] = useState(null);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('auth/register', form );
            localStorage.setItem('token', response.token);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <Box maxWidth="400px" mx='auto' mt={10}>
            <Typography variant="h5" mb={2} >Register</Typography>
            { error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit} >
                <TextField 
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField 
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField 
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mt: 2 }} >
                    Register
                </Button>
            </form>
            <Typography variant="body2" mt={2}>
                Already have an account? <Link to="/login">Login here</Link>
            </Typography>
        </Box>
    );

};

export default RegisterPage;