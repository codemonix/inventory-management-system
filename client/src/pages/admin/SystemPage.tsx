import { ChangeEvent, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    Box, Typography, Paper, Button, Divider, 
    FormControl, Alert, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
    TextField, Stack, MenuItem, Select, InputLabel, FormGroup, FormControlLabel, Switch, 
    alpha,
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
    const [localDemoMode, setLocalDemoMode] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<PendingAction | null>(null);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [confirmPhrase, setConfirmPhrase] = useState('');

    const [settings, setSettings] = useState<Pick<ISystemSettings, 'logLevel' | 'enableDbLogging' | 'demoMode'>>({
        logLevel: 'info',
        enableDbLogging: true,
        demoMode: false,
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
        setLocalDemoMode(Boolean(settings.demoMode));
    }, [settings]);

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            const saved = await updateSystemSettings({ 
                logLevel: localLogLevel,
                enableDbLogging: localEnableDbLogging,
                demoMode: localDemoMode,
            });
            setSettings(saved);
            setMessage("Settings updated successfully.");
            setTimeout(() => setMessage(null), 2500);
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Settings update failed."));
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
        localEnableDbLogging !== settings?.enableDbLogging ||
        localDemoMode !== Boolean(settings?.demoMode);

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

    // Shared look for the three section cards
    const sectionSx = { p: { xs: 2, md: 3 }, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' } as const;
    const settingHelpSx = { ml: 6, mt: -0.5, display: 'block' } as const;

    return (
        <Box maxWidth="lg" mx="auto" p={1}>
            {/* Page header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight="bold">System</Typography>
                <Chip label={`v${__APP_VERSION__}`} size="small" variant="outlined" />
            </Box>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack spacing={3}>

                {/* 1. SYSTEM SETTINGS (full width: the most used section) */}
                <Paper variant="outlined" sx={sectionSx}>
                    <Typography variant="h6">System Settings</Typography>
                    <Divider sx={{ my: 2 }} />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            columnGap: 4,
                            rowGap: 3,
                        }}
                    >
                        {/* General */}
                        <Box>
                            <Typography variant="overline" color="text.secondary">General</Typography>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={localDemoMode}
                                            onChange={(e) => setLocalDemoMode(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Demo mode"
                                />
                                <Typography variant="caption" color="text.secondary" sx={settingHelpSx}>
                                    Shows a button on the login page that fills in the demo account (demo@ims.com).
                                </Typography>
                            </FormGroup>
                        </Box>

                        {/* Logging */}
                        <Box>
                            <Typography variant="overline" color="text.secondary">Logging</Typography>
                            <FormGroup sx={{ mb: 2.5 }}>
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
                                <Typography variant="caption" color="text.secondary" sx={settingHelpSx}>
                                    Toggle off to stop writing logs to MongoDB. Terminal logs will remain active.
                                </Typography>
                            </FormGroup>

                            <FormControl fullWidth size="small">
                                <InputLabel id="log-level-label">Log Level</InputLabel>
                                <Select
                                    labelId="log-level-label"
                                    value={localLogLevel}
                                    label="Log Level"
                                    onChange={(e) => setLocalLogLevel(e.target.value)}
                                >
                                    <MenuItem value="error">Error Only</MenuItem>
                                    <MenuItem value="warn">Warnings & Errors</MenuItem>
                                    <MenuItem value="info">Info (Standard)</MenuItem>
                                    <MenuItem value="debug">Debug (Verbose)</MenuItem>
                                </Select>
                            </FormControl>

                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mt={2.5}>
                                <Typography variant="caption" color="text.secondary">
                                    Clearing system logs does not affect inventory transactions.
                                </Typography>
                                <Button
                                    variant="text"
                                    color="error"
                                    size="small"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleClearLogs}
                                    sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                                >
                                    Clear Logs
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* One save action for every setting above */}
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                        {hasUnsavedChanges && (
                            <Typography variant="body2" color="warning.main">Unsaved changes</Typography>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveSettings}
                            disabled={isLoading || !hasUnsavedChanges}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            Save Settings
                        </Button>
                    </Box>
                </Paper>

                {/* 2 + 3: data operations side by side, equal height */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 3,
                    }}
                >
                    {/* 2. BACKUP & RESTORE */}
                    <Paper variant="outlined" sx={sectionSx}>
                        <Typography variant="h6">Backup & Restore</Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box mb={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Download a full ZIP backup (database + images).
                            </Typography>
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

                        <Box mt="auto">
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Restore from a .zip backup. This overwrites all current data.
                            </Typography>
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

                    {/* 3. DANGER ZONE */}
                    <Paper
                        variant="outlined"
                        sx={{
                            ...sectionSx,
                            // Faint red tint that works in light and dark mode
                            borderColor: 'error.main',
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <WarningAmberIcon color="error" />
                            <Typography variant="h6" color="error">Danger Zone</Typography>
                        </Box>
                        <Divider sx={{ my: 2, borderColor: (theme) => alpha(theme.palette.error.main, 0.3) }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="body2">Delete all transfers</Typography>
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
                            <Typography variant="body2">Delete all items</Typography>
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
                            sx={{ mt: 'auto' }}
                        >
                            Factory Reset
                        </Button>
                    </Paper>
                </Box>
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