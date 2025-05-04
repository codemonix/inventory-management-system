import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

const ConfirmModal = ({ open, title, message, onConfirm, onClose, error }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error">
                    Confirm
                </Button>
            </DialogActions>
            {error && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Dialog>

    );
};

export default ConfirmModal;