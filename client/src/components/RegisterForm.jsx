import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { TextField, Button } from '@mui/material';

import api from '../api/api';

const RegisterForm = ({ onError }) => {
    const navigate = useNavigate();
    const [ formData, setFormData ] = useState({ name: '', email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('auth/register', formData );
            localStorage.setItem('token', response.token);
            navigate('/');
        } catch (error) {
            onError?.(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <form onSubmit={handleSubmit} >
            <TextField 
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField 
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField 
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mt: 2 }} >
                Register
            </Button>
        </form>
    )
};

export default RegisterForm
