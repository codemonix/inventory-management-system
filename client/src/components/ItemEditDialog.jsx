
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { logError } from '../utils/logger';

const EditItemDialog = ({ open, onClose, item, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && item) {
            setFormData({
                name: item.name,
                price: item.price,
            });
        }
    }, [open, item]);


    const handleChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            logError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <Button onClick={() => onClose()} color='secondary'>Cancel</Button>
                    <Button 
                        type='submit' 
                        color='primary' 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saveing...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );    
};

export default EditItemDialog;