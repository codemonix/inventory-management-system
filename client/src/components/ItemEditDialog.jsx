import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider } from '@mui/material';
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                
                {/* 1. Themed Title Bar */}
                <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'background.paper', pb: 2 }}>
                    Edit Item
                </DialogTitle>
                
                <Divider />

                {/* 2. Themed Content Area */}
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3, pb: 4, bgcolor: 'background.default' }}>
                    <TextField 
                        autoFocus
                        name="name"
                        label="Item Name"
                        type="text"
                        fullWidth
                        value={formData.name || ''}
                        onChange={handleChange}
                        sx={{ bgcolor: 'background.paper' }} // Makes input pure white against default background
                    />
                    <TextField 
                        name="price"
                        label="Item Price (€)"
                        type="number"
                        fullWidth
                        value={formData.price || ''} 
                        onChange={handleChange}
                        sx={{ bgcolor: 'background.paper' }}
                        slotProps={{
                            input: { min: 0, step: "0.01" } // Sensible defaults for currency
                        }}
                    />
                </DialogContent>

                <Divider />

                {/* 3. Themed Action Bar */}
                <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
                    <Button 
                        onClick={() => onClose()} 
                        color="inherit" 
                        disabled={isSubmitting}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        color="primary" 
                        disabled={isSubmitting || !formData.name.trim()} // Prevents empty name submissions
                        sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );    
};

export default EditItemDialog;