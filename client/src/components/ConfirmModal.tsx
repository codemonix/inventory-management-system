import { ReactNode } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Divider,
    Alert,
    Box,
    ButtonProps,
} from "@mui/material";

interface ConfirmModalProps {
    open: boolean;
    title: ReactNode;
    message: ReactNode;
    onConfirm: () => void;
    onClose: () => void;
    error?: string | null;
    confirmLabel?: string;
    // Red by default, because this modal is mostly used for deletions
    confirmColor?: ButtonProps['color'];
    isSubmitting?: boolean;
}

const ConfirmModal = ({
    open, title, message, onConfirm, onClose, error,
    confirmLabel = 'Confirm', confirmColor = 'error', isSubmitting = false,
}: ConfirmModalProps) => {
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
                    color={confirmColor}
                    disabled={isSubmitting}
                    sx={{ 
                        borderRadius: 2, 
                        px: 3, 
                        fontWeight: 'bold',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' }
                    }}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;
