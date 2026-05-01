import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Divider,
    Alert,
    Box
} from "@mui/material";

const ConfirmModal = ({ open, title, message, onConfirm, onClose, error }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            {/* 1. Themed Title Bar */}
            <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'background.paper', py: 2 }}>
                {title}
            </DialogTitle>
            
            <Divider />

            {/* 2. Themed Content Area */}
            <DialogContent sx={{ bgcolor: 'background.default', pt: 3, pb: 4 }}>
                <DialogContentText sx={{ color: 'text.primary', mb: error ? 2 : 0 }}>
                    {message}
                </DialogContentText>

                {error && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                            {error}
                        </Alert>
                    </Box>
                )}
            </DialogContent>

            <Divider />

            {/* 3. Themed Action Bar */}
            <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
                <Button 
                    onClick={onClose} 
                    color="inherit" 
                    sx={{ fontWeight: 'bold' }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained"
                    color="error" // Stays red because this modal is usually for deletions/confirmations
                    sx={{ 
                        borderRadius: 2, 
                        px: 3, 
                        fontWeight: 'bold',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none', bgcolor: 'error.dark' }
                    }}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;