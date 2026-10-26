import { ChangeEvent, useState, useEffect } from 'react';
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

import { downloadBackup, restoreSystem, clearSystemData, performFactoryReset } from '../../services/systemService';
import { fetchSystemSettings, updateSystemSettings } from '../../services/settingsService';
import { clearSystemLogs } from '../../services/systemLogService';
import ConfirmModal from '../../components/ConfirmModal';
import { logError } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errorMessage';
import { ISystemSettings } from '../../types/setting.types';

type PendingAction = 'RESTORE' | 'CLEAR_TRANSFERS' | 'CLEAR_ITEMS' | 'CLEAR_LOGS';

const SettingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [localLogLevel, setLocalLogLevel] = useState('info');
    const [localEnableDbLogging, setLocalEnableDbLogging] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<PendingAction | null>(null);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [confirmPhrase, setConfirmPhrase] = useState('');

    const [settings, setSettings] = useState<Pick<ISystemSettings, 'logLevel' | 'enableDbLogging'>>({
        logLevel: 'info',
        enableDbLogging: true
    });
    const [isLoading, setIsLoading] = useState(false);



    const { logout } = useAuth();

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const config = await fetchSystemSettings();
                setSettings(config);
            } catch (err: unknown) {
                logError("SystemPage -> loadSettings err:", getErrorMessage(err))
            }
        }
        loadSettings();
    }, []);

    useEffect(() => {
        if (settings.logLevel) {
            setLocalLogLevel(settings.logLevel);
        }
        if (settings.enableDbLogging !== undefined) {
            setLocalEnableDbLogging(settings.enableDbLogging);
        }
    }, [settings]);

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            await updateSystemSettings({ 
                ...settings, 
                logLevel: localLogLevel,
                enableDbLogging: localEnableDbLogging
            });
            setMessage("Logging settings updated successfully.");
            setTimeout(() => setMessage(null), 2500);
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Logging settings update failed."));
            logError("SystemPage -> handleSaveSettings err:", getErrorMessage(err))
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearLogs = () => {
        setActionType('CLEAR_LOGS');
        setConfirmOpen(true);
    };

    const hasUnsavedChanges = 
        localLogLevel !== settings?.logLevel ||
        localEnableDbLogging !== settings?.enableDbLogging;

    // 1. BACKUP
    const handleBackup = async () => {
        setLoading(true);
        try {
            await downloadBackup();
            setMessage("Backup downloaded successfully.");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Backup failed."));
            logError("SystemPage -> handleBackup err:", getErrorMessage(err))
        } finally {
            setLoading(false);
        }
    };

    // 2. FILE SELECTION (For Restore)
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
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
            if (actionType === 'RESTORE' && restoreFile) {
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
            else if (actionType === 'CLEAR_LOGS') {
                await clearSystemLogs();
                setMessage("System logs cleared.");
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Operation failed."));
            logError("SystemPage -> executeAction err:", actionType, getErrorMessage(err));
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
            // Admin accounts survive a reset, so the current session stays valid
            await performFactoryReset(confirmPhrase);
            setConfirmPhrase('');
            setMessage("Factory reset complete. All data was removed; admin accounts were kept.");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Reset failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth="lg" mx="auto" p={1}>
            <Box px={1} py={0.5} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
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
                message={
                    actionType === 'RESTORE' ? "This will overwrite all data. Are you sure?"
                    : actionType === 'CLEAR_LOGS' ? "All system logs will be permanently deleted. This cannot be undone."
                    : "This cannot be undone."
                }
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