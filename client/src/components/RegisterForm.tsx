import { useNavigate } from 'react-router-dom';
import { ChangeEvent, FormEvent, useState } from 'react';
import { TextField, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorMessage';

interface RegisterFormProps {
    onError?: (message: string) => void;
    // Called when the account was created but must be approved before logging in
    onPendingApproval?: () => void;
}

const RegisterForm = ({ onError, onPendingApproval }: RegisterFormProps) => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [ formData, setFormData ] = useState({ name: '', email: '', password: '' });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const loggedIn = await register(formData);
            if (loggedIn) navigate('/');
            else onPendingApproval?.();
        } catch (error: unknown) {
            onError?.(getErrorMessage(error, "Registration failed"));
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
            <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mt: 2 }}>
                Register
            </Button>
        </form>
    )
};

export default RegisterForm
