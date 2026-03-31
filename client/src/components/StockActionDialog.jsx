import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Typography
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { logDebug, logInfo } from "../utils/logger";

const StockActionDialog = ({ 
        open, onClose, onSubmit, 
        locations, type, errorMessage, 
        defaultLocation = null 
    }) => {
        const [ locationId, setLocationId ] = useState('');
        const [ quantity, setQuantity ] = useState('');

        logDebug("StockActionDialog.jsx -> locations:", locations);

        useEffect(() => {
            if (open) {
                setQuantity('');
                if (defaultLocation) {
                    setLocationId(defaultLocation);                
                } else if (locations.length > 0) {
                    setLocationId(locations[0]._id);
                } else {
                    setLocationId('');
                }
            }
        },[open, defaultLocation, locations]);

        const handleSubmit = (e) => {
            e.preventDefault();
            
            if (Number(quantity) > 0 && locationId) {
                onSubmit(locationId, Number(quantity));
            }
            logInfo("StockAction submitted.")
        };

        const getDialogTitle = () => {
            switch (type) {
                case 'IN':
                    return 'Add Stock';
                case 'OUT':
                    return 'Remove Stock';
                case 'TRANSFER':
                    return 'Transfer Stock';
                default:
                    return 'Stock Action';
            }
        };

        return (
            <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
                <form onSubmit={handleSubmit} >
                    <DialogTitle sx={{ fontSize: "1rem", pb: 0.5}} >{getDialogTitle()}</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: "column", gap: 1, pt: 1 , minWidth: 250 }}  >
                        {errorMessage && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>
                                {errorMessage}
                            </Typography>
                        )}
                        <TextField sx={{ mt: 1 }}
                        select
                        fullWidth
                        label="Select Location"
                        value={locationId}
                        onChange={ (e) => setLocationId(e.target.value)}
                        >
                            {locations.map((loc) => (
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
                            error={!!errorMessage}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <IconButton 
                            type="submit" 
                            color="primary" 
                            aria-label="submit" 
                            disabled={!locationId || Number(quantity) <= 0}
                        >
                            <CheckIcon />
                        </IconButton>
                        <IconButton onClick={onClose} color="error" aria-label="cancel" >
                            <CloseIcon />
                        </IconButton>
                    </DialogActions>
                </form>
            </Dialog>
        );
};

export default StockActionDialog