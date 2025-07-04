
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState } from 'react';

const EditItemDialog = ({ open, onClose, item, onSave }) => {
    const [formData, setFormData] = useState({
        name: item?.name,
        price: item?.price,
    });

    const handleChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        try {
            onSave(formData);
            onClose();
        } catch (error) {
            logError(error.message);
        }
    };

    const handleClose = () => {
        onClose();
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Item</DialogTitle>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>

            <DialogContent>
                <TextField autoFocus
                    margin="dense"
                    name='name'
                    label="Item Name"
                    type="text"
                    fullWidth
                    value={formData.name || ''}
                    onChange={handleChange}
                />
                <TextField 
                    margin="dense"
                    name='price'
                    label="Item Price"
                    type="number"
                    fullWidth
                    value={formData.price || ''} 
                    onChange={handleChange}
                />
            </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='secondary'>Cancel</Button>
                    <Button type='submit' color='primary'>Save</Button>
                </DialogActions>
            </form>

        </Dialog>

    );    
};

export default EditItemDialog;