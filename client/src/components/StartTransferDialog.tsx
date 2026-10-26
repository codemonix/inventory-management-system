import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { useAppSelector } from '../redux/hooks';

interface StartTransferDialogProps {
    open: boolean;
    onClose: () => void;
    onStartNewTransfer: (fromLocation: string, toLocation: string) => void;
}

const StartTransferDialog = ({ open, onClose, onStartNewTransfer }: StartTransferDialogProps) => {
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
    const locations = useAppSelector((state) => state.locations.locations);

    // The button is disabled and the field shows a hint until two different locations are chosen
    const handleStartTransfer = () => {
        if (!fromLocation || !toLocation || fromLocation === toLocation) return;
        onStartNewTransfer(fromLocation, toLocation);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Start New Transfer</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                <TextField
                    select
                    fullWidth
                    label="From Location"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                >
                    {locations.map((location) => (
                        <MenuItem key={location._id} value={location._id}>{location.name}</MenuItem>
                    ))}
                </TextField>
                
                <TextField
                    select
                    fullWidth
                    label="To Location"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    error={fromLocation === toLocation && fromLocation !== ""}
                    helperText={fromLocation === toLocation && fromLocation !== "" ? "Destination must be different" : ""}
                >
                    {locations.map((location) => (
                        <MenuItem key={location._id} value={location._id}>{location.name}</MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleStartTransfer} variant="contained" color="primary" disabled={!fromLocation || !toLocation || fromLocation === toLocation}>
                    Start Transfer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StartTransferDialog;