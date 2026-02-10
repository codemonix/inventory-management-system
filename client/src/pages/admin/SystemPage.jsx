import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    Box, Typography, Paper, Button, Divider, 
    Grid, Alert, CircularProgress, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
    TextField, Stack 
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { downloadBackup, restoreSystem, clearSystemData, performFactoryReset } from '../../services/systemService';
import ConfirmModal from '../../components/ConfirmModal';

const SettingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    
    // Modals
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    
    // State for actions
    const [actionType, setActionType] = useState(null); // 'RESTORE', 'CLEAR_TRANSFERS', 'CLEAR_ITEMS'
    const [restoreFile, setRestoreFile] = useState(null);
    const [confirmPhrase, setConfirmPhrase] = useState('');

    const navigate = useNavigate();
    const { logout } = useAuth();

    // 1. BACKUP
    const handleBackup = async () => {
        setLoading(true);
        try {
            await downloadBackup();
            setMessage("Backup downloaded successfully.");
        } catch (err) {
            setError("Backup failed.");
            console.log("Systempage.jsx -> handleBackup err:", err.message)
        } finally {
            setLoading(false);
        }
    };

    // 2. FILE SELECTION (For Restore)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRestoreFile(file);
            setActionType('RESTORE');
            setConfirmOpen(true);
        }
    };

    // 3. ACTION HANDLER (Restore & Clear)
    const executeAction = async () => {
        setConfirmOpen(false);
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (actionType === 'RESTORE') {
                await restoreSystem(restoreFile);
                setMessage("System restored successfully. Reloading...");
                setTimeout(() => { logout(); window.location.reload(); }, 2000);
            } 
            else if (actionType === 'CLEAR_TRANSFERS') {
                await clearSystemData('transfers');
                setMessage("Transfers cleared.");
            }
            else if (actionType === 'CLEAR_ITEMS') {
                await clearSystemData('items');
                setMessage("Items cleared.");
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
            setRestoreFile(null);
        }
    };

    // 4. FACTORY RESET
    const executeFactoryReset = async () => {
        if (confirmPhrase !== 'DELETE EVERYTHING') return;
        setResetDialogOpen(false);
        setLoading(true);
        try {
            await performFactoryReset(confirmPhrase);
            logout();
            navigate('/setup', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || "Reset failed");
            setLoading(false);
        }
    };

    return (
        <Box maxWidth="lg" mx="auto" p={2}>
            <Typography variant="h4" gutterBottom>System Administration</Typography>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack spacing={3} sx={{ width: '100%' }} direction={{ xs: 'column', md: 'row' }}>
                
                {/* 1. BACKUP SECTION */}
                <Paper 
                    sx={{ 
                        p: 3, 
                        width: '100%' // Force full width
                    }}
                >
                    <Typography variant="h6">Backup & Restore</Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box mb={3}>
                        <Typography variant="body2" gutterBottom>Download full ZIP backup (DB + Images).</Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<CloudDownloadIcon />} 
                            onClick={handleBackup} 
                            disabled={loading}
                            fullWidth
                        >
                            Download Backup
                        </Button>
                    </Box>

                    <Box>
                        <Typography variant="body2" gutterBottom>Restore from .zip backup.</Typography>
                        <Button 
                            component="label" 
                            variant="outlined" 
                            startIcon={<CloudUploadIcon />} 
                            color="warning" 
                            disabled={loading}
                            fullWidth
                        >
                            Upload & Restore
                            <input type="file" hidden accept=".zip" onChange={handleFileChange} />
                        </Button>
                    </Box>
                </Paper>

                {/* 2. DANGER ZONE */}
                <Card 
                    sx={{ 
                        borderColor: 'error.main', 
                        border: 1, 
                        bgcolor: '#fff5f5',
                        width: '100%' // Force full width
                    }}
                >
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={1}>
                            <WarningAmberIcon color="error" />
                            <Typography variant="h6" color="error">Danger Zone</Typography>
                        </Box>
                        <Divider sx={{ my: 2, borderColor: '#feb2b2' }} />
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="body2">Delete Transfers</Typography>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                size="small" 
                                onClick={() => { setActionType('CLEAR_TRANSFERS'); setConfirmOpen(true); }}
                            >
                                Clear
                            </Button>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="body2">Delete Items</Typography>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                size="small" 
                                onClick={() => { setActionType('CLEAR_ITEMS'); setConfirmOpen(true); }}
                            >
                                Clear
                            </Button>
                        </Box>

                        <Button 
                            variant="contained" 
                            color="error" 
                            fullWidth 
                            startIcon={<DeleteForeverIcon />} 
                            onClick={() => { setConfirmPhrase(''); setResetDialogOpen(true); }}
                        >
                            FACTORY RESET
                        </Button>
                    </CardContent>
                </Card>

            </Stack>
            {loading && <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>}

            {/* RESTORE / CLEAR CONFIRMATION */}
            <ConfirmModal 
                open={confirmOpen}
                title="Confirm Action"
                message={actionType === 'RESTORE' ? "This will overwrite all data. Are you sure?" : "This cannot be undone."}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeAction}
            />

            {/* FACTORY RESET DIALOG */}
            <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
                <DialogTitle sx={{ color: 'error.main' }}>CRITICAL WARNING</DialogTitle>
                <DialogContent>
                    <DialogContentText>Type <strong>DELETE EVERYTHING</strong> to wipe the system.</DialogContentText>
                    <TextField 
                        autoFocus margin="dense" fullWidth placeholder="DELETE EVERYTHING" 
                        value={confirmPhrase} onChange={(e) => setConfirmPhrase(e.target.value)} 
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
                    <Button onClick={executeFactoryReset} color="error" variant="contained" disabled={confirmPhrase !== 'DELETE EVERYTHING'}>
                        Wipe System
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;