import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { 
    Box, Typography, Paper, Button, Divider, 
    FormControl, Alert, CircularProgress, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
    TextField, Stack, MenuItem, Select, InputLabel, FormGroup, FormControlLabel, Switch, 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { downloadBackup, restoreSystem, clearSystemData, performFactoryReset } from '../../services/systemService.js';
import { fetchSystemSettings, updateSystemSettings, clearSystemLogs } from '../../redux/thunks/systemThunks.js';
import ConfirmModal from '../../components/ConfirmModal';
import { logError } from '../../utils/logger.js';

const SettingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const { settings, isLoading } = useSelector((state) => state.system);
    const [localLogLevel, setLocalLogLevel] = useState('info');
    const [localEnableDbLogging, setLocalEnableDbLogging] = useState(true)

    useEffect(() => {
        dispatch(fetchSystemSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings.logLevel) {
            setLocalLogLevel(settings.logLevel);
        }
        if (settings.enableDbLogging !== undefined) {
            setLocalEnableDbLogging(settings.enableDbLogging);
        }
    }, [settings]);

    const handleSaveSettings = () => {
        dispatch(updateSystemSettings({ 
            ...settings, 
            logLevel: localLogLevel,
            enableDbLogging: localEnableDbLogging
        }));
        setMessage("Logging settings updated successfully.");
        setTimeout(() => setMessage(null), 2500);
    };

    const handleClearLogs = () => {
        if (window.confirm('Are you sure you want to permamently delete all system logs?')) {
            dispatch(clearSystemLogs());
        }
    };

    const hasUnsavedChanges = 
        localLogLevel !== settings?.logLevel ||
        localEnableDbLogging !== settings?.enableDbLogging;
    
    
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
            logError("Systempage.jsx -> handleBackup err:", err.message)
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
        <Box maxWidth="lg" mx="auto" p={1}>
            <Box px={1} py={0.5} sx={{ bgcolor: 'grey.200', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    v{__APP_VERSION__} 
                </Typography>
            </Box>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack spacing={3} sx={{ width: '100%' }} direction={{ xs: 'column', md: 'row' }}>
                
                {/* 1. BACKUP SECTION */}
                <Paper 
                    sx={{ 
                        p: 2, 
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

                {/* System Settings */}
                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>System Diagnostics & Logging</Typography>
                    <Divider sx={{ mb: 3 }} />

                    <FormGroup sx={{ mb: 3 }}>
                        <FormControlLabel 
                            control={
                                <Switch 
                                    checked={localEnableDbLogging} 
                                    onChange={(e) => setLocalEnableDbLogging(e.target.checked)} 
                                    color="primary" 
                                />
                            } 
                            label="Enable Database Logging" 
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mt: -1, display: 'block' }}>
                            Toggle off to stop writing logs to MongoDB. Terminal logs will remain active.
                        </Typography>
                    </FormGroup>
                    
                    <Box display="flex" alignItems="center" gap={3} mb={3}>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Log Level</InputLabel>
                            <Select
                                value={localLogLevel}
                                label="Database Log Level"
                                onChange={(e) => setLocalLogLevel(e.target.value)}
                            >
                                <MenuItem value="error">Error Only</MenuItem>
                                <MenuItem value="warn">Warnings & Errors</MenuItem>
                                <MenuItem value="info">Info (Standard)</MenuItem>
                                <MenuItem value="debug">Debug (Verbose)</MenuItem>
                            </Select>
                        </FormControl>

                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<SaveIcon />}
                            onClick={handleSaveSettings}
                            disabled={isLoading || !hasUnsavedChanges}
                        >
                        Settings
                        </Button>
                    </Box>

                    <Box mt={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Clearing system logs will not affect your business inventory transactions.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={handleClearLogs}
                        >
                            Clear System Logs
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