import { useState } from 'react';
import { 
    TextField, 
    Button, 
    Typography, 
    Box, 
    Paper, 
    Alert, 
    CircularProgress,
    Fade
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { logInfo, logError } from '../utils/logger';


export default function CreateForm ({ title, label, placeholder, onCreate, onSuccess }) {
    const [name, setName] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent submission of empty space
        if (!name.trim()) return;

        setStatus({ loading: true, error: '' });

        try {
            const result = await onCreate({ name: name.trim() });
            onSuccess(result);
            setName('');
            setStatus({ loading: false, error: '' });
            logInfo("CreateForm.jsx -> handleSubmit -> create successful")
        } catch (error) {
            logError("CreateForm.jsx -> handleSubmit -> error:", error.message);
            const errorMessage = error.response?.data?.message || error.message || "Failed to create entry." ;
            setStatus({ loading: false, error: errorMessage });
        }
    };

    return (
        <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
                p: 4, 
                borderRadius: 3, 
                bgcolor: 'background.paper',
                height: '100%',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }
            }}
        >
            <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                {title}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the details below to add a new record to your system.
            </Typography>

            <Fade in={!!status.error}>
                <Box>
                    {status.error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {status.error}
                        </Alert>
                    )}
                </Box>
            </Fade>

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                    fullWidth
                    label={label}
                    placeholder={placeholder}
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status.loading}
                    required
                    autoComplete="off"
                    sx={{ mb: 3 }}
                />
                
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disableElevation
                    disabled={status.loading || !name.trim()}
                    startIcon={status.loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />}
                    sx={{ 
                        py: 1.5, 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontSize: '1rem',
                        fontWeight: 600
                    }}
                >
                    {status.loading ? 'Processing...' : `Create ${label}`}
                </Button>
            </Box>
        </Paper>
    )
}