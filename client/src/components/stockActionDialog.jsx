import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    IconButton,
    FormControl,
    FormHelperText
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const StockActionDialog = ({ open, onClose, onSubmit, itemId, locations, type, errorMessage, defaultLocation }) => {
    const [ locationId, setLocationId ] = useState('');
    const [ quantity, setQuantity ] = useState('');

    useEffect(() => {
        setLocationId(defaultLocation)
    },[defaultLocation])

    const handleSubmit = () => {
        onSubmit({ itemId, locationId, quantity: Number(quantity) });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ fontSize: "1rem", p: 1}} >{type === 'IN' ? 'Add' : type === 'OUT' ? 'Remove' : 'Transfer'} </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: "column", gap: 1, pt: 1 , minWidth: 300 }}  >
                <FormControl sx={{ pt: 1}} fullWidth error={!!errorMessage}>
                    <TextField sx={{ pt: 1}}
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
                </FormControl>
                <FormControl fullWidth >
                    <TextField 
                        type="number"
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </FormControl>
                { errorMessage && <FormHelperText error >{errorMessage}</FormHelperText>}
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