import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    IconButton
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const StockActionDialog = ({ open, onClose, onSubmit, itemId, locations, type }) => {
    const [ locationId, setLocationId ] = useState('');
    const [ quantity, setQuantity ] = useState('');

    const handleSubmit = () => {
        onSubmit({ itemId, locationId, quantity: Number(quantity) });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle >{type === 'IN' ? 'Add' : type === 'OUT' ? 'Remove' : 'Transfer'} </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: "column", gap: 2 , minWidth: 300 }}  >
                <TextField 
                select
                label="Select Location"
                value={locationId}
                onChange={ (e) => setLocationId(e.target.value)}
                >
                    { locations.map(loc => (
                        <MenuItem key={loc._id} value={loc._id}>
                            {loc.name}
                        </MenuItem>
                    )) }
                </TextField>
                <TextField 
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <IconButton onClick={handleSubmit} color="primary" aria-label="submit" >
                    <CheckIcon />
                </IconButton>
                <IconButton onClick={onClose} color="error" aria-label="cancel" >
                    <CloseIcon />
                </IconButton>
            </DialogActions>
        </Dialog>
    );
};

export default StockActionDialog