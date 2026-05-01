import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Typography,
    Divider,
    Box
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import { logDebug, logInfo } from "../utils/logger";

const StockActionDialog = ({ 
    open, onClose, onSubmit, 
    locations, type, errorMessage, 
    defaultLocation = null 
}) => {
    const [locationId, setLocationId] = useState('');
    const [quantity, setQuantity] = useState('');

    logDebug("StockActionDialog.jsx -> locations:", locations);

    useEffect(() => {
        if (open) {
            setQuantity('');
            if (defaultLocation) {
                setLocationId(defaultLocation);                
            } else if (locations?.length > 0) {
                setLocationId(locations[0]._id);
            } else {
                setLocationId('');
            }
        }
    }, [open, defaultLocation, locations]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (Number(quantity) > 0 && locationId) {
            onSubmit(locationId, Number(quantity));
        }
        logInfo("StockAction submitted.");
    };

    const getDialogTitle = () => {
        switch (type) {
            case 'IN': return 'Add Stock';
            case 'OUT': return 'Remove Stock';
            case 'TRANSFER': return 'Stage for Transfer';
            default: return 'Stock Action';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <form onSubmit={handleSubmit}>
                
                {/* 1. Themed Title Bar */}
                <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'background.paper', pb: 2 }}>
                    {getDialogTitle()}
                </DialogTitle>
                
                <Divider />

                {/* 2. Themed Content Area (uses default background to make inputs pop) */}
                <DialogContent sx={{ display: 'flex', flexDirection: "column", gap: 2.5, pt: 3, pb: 4, bgcolor: 'background.default' }}>
                    
                    {errorMessage && (
                        <Box sx={{ bgcolor: 'error.lighter', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
                            <Typography color="error.main" variant="body2" sx={{ fontWeight: 'bold' }}>
                                {errorMessage}
                            </Typography>
                        </Box>
                    )}

                    <TextField 
                        select
                        fullWidth
                        label="Select Location"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        error={!!errorMessage && !locationId}
                        sx={{ bgcolor: 'background.paper' }} // Makes input field pure white
                    >
                        {locations?.map((loc) => (
                            <MenuItem key={loc._id} value={loc._id}>
                                {loc.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField 
                        type="number"
                        fullWidth
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        autoFocus
                        error={!!errorMessage && Number(quantity) <= 0}
                        sx={{ bgcolor: 'background.paper' }} // Makes input field pure white
                        slotProps={{
                            input: { min: 1 }
                        }}
                    />
                </DialogContent>

                <Divider />

                {/* 3. Themed Action Bar with explicit Text Buttons */}
                <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
                    <Button 
                        onClick={onClose} 
                        color="inherit" 
                        sx={{ fontWeight: 'bold' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        color={type === 'OUT' ? 'error' : 'primary'} // Contextual color based on destructive vs additive action
                        disabled={!locationId || Number(quantity) <= 0}
                        startIcon={<CheckIcon />}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Confirm
                    </Button>
                </DialogActions>

            </form>
        </Dialog>
    );
};

export default StockActionDialog;