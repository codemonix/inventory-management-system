import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToTempTransfer, initialaizeTempTransfer } from "../redux/slices/transferSlice.js";
import { Dialog, DialogTitle, 
        DialogContent, DialogActions, 
        TextField, Button, MenuItem } from "@mui/material";

const AddToTransferDialog = ({ open, onClose, itemId, locations }) => {
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();
    const tempTransfer = useSelector((state) => state.transfer.tempTransfer);

    const handleAdd = () => {
        if (tempTransfer.items.length === 0) {
            dispatch(initialaizeTempTransfer(fromLocation, toLocation));
        } else {
            if (tempTransfer.fromLocation !== fromLocation || tempTransfer.toLocation !== toLocation) {
                alert("Please make sure the from and to locations are the same.");
                return;
            }
        }
        dispatch(addToTempTransfer(itemId, quantity));
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add to Transfer</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    margin="dense"
                    label="From Location"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    fullWidth
                >
                    {locations.map((location) => (
                        <MenuItem key={location} value={location}>
                            {location}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="To Location"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    fullWidth
                    margin="dense"
                >
                    {locations.map((location) => (
                        <MenuItem key={location} value={location}>
                            {location}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    margin="dense"
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleAdd} variant="contained" color="primary">Add</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddToTransferDialog;