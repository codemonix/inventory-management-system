import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Box, TextField, Button, Alert } from "@mui/material";
import { logDebug, logError, logInfo } from "../utils/logger";
import { getErrorMessage } from "../utils/errorMessage";

function LoginForm() {
    const { login } = useAuth(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null); 

    // Runtime config (set per deployment) wins over the build-time default
    const isDemo = window.env?.IS_DEMO ?? import.meta.env.VITE_IS_DEMO === 'true';

    logInfo("Demo mode active:", isDemo)

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Clear previous errors on new submission

        try {
            await login(email, password);
            logDebug("Login successful,", email);
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, "Login failed.");
            logError("Login error:", errorMessage);
            setError(errorMessage);
        }
    };

    const fillDemoCredentials = () => {
        setEmail("demo@ims.com");
        setPassword("demo123");
    }

    return (
        <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 'sm', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* Themed Demo Box */}
            {isDemo && (
                <Alert 
                    severity="info" 
                    sx={{ mb: 1, borderRadius: 2, alignItems: 'center' }}
                    action={
                        <Button 
                            color="info" 
                            size="small" 
                            variant="outlined"
                            onClick={fillDemoCredentials}
                            sx={{ bgcolor: 'background.paper' }}
                        >
                            Auto-Fill
                        </Button>
                    }
                >
                    Demo mode is active.
                </Alert>
            )}

            <TextField
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
            />

            <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
            />

            <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                disableElevation
                sx={{ py: 1.5, mt: 1, borderRadius: 2, fontWeight: 'bold' }}
            >
                Login
            </Button>

            {/* Themed Error Handling */}
            {error && (
                <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

        </Box>
    );
};

export default LoginForm;