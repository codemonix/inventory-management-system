import { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
    Alert
} from "@mui/material";
import { updateUser } from "../../services/userService";
import { logInfo } from "../../utils/logger";
import { getErrorMessage } from "../../utils/errorMessage";
import { IUserRecord, UserUpdate } from "../../types/user.types";

interface EditUserDialogProps {
    open: boolean;
    onClose: () => void;
    user: IUserRecord;
}

const EditUserDialog = ({ open, onClose, user }: EditUserDialogProps) => {
    const { isAdmin, isManager } = useAuth();
    const isAdminOrManager = isAdmin || isManager;

    const [formData, setFormData] = useState<UserUpdate>({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        isApproved: user.isApproved || false,
        isActive: user.isActive || false,
    });

    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setSaveError(null);
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                isActive: user.isActive
            })
        }
    },[user]);


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData( (prev) => ({ ...prev, [name]: value}));
    };

    const handleToggleActive = () => {
        setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleToggleApproved = () => {
        setFormData((prev) => ({ ...prev, isApproved: !prev.isApproved }));
    };

    const handleSubmit = async () => {
        logInfo("formData:", formData)
        setSaveError(null);
        setIsSubmitting(true);
        try {
            await updateUser(user._id, formData);
            onClose();
        } catch (error: unknown) {
            // e.g. a manager trying to edit an admin, or an admin demoting themselves
            setSaveError(getErrorMessage(error, "Failed to update user."));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth >
            <DialogTitle >Edit User</DialogTitle>
            <DialogContent>
                {saveError && <Alert severity="error" sx={{ mb: 1 }}>{saveError}</Alert>}
                <TextField
                    margin="dense"
                    label="Name"
                    name="name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField 
                    margin="dense"
                    label="Email"
                    name="email"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                />
                { isAdmin && (
                    <TextField 
                        margin="dense"
                        label="Role"
                        name="role"
                        select
                        fullWidth
                        value={formData.role}
                        onChange={handleChange}
                    >
                    {[ "admin", "manager", "user" ].map( (r) => (
                        <MenuItem key={r} value={r}  >
                            {r}
                        </MenuItem>
                    ))}
                    </TextField>
                )}
                { isAdmin && (
                    <FormControlLabel 
                        control={
                            <Switch 
                                checked={formData.isApproved}
                                onChange={handleToggleApproved}
                            />
                        }
                        label="Approved"
                    />
                )}
                { isAdminOrManager && (
                    <FormControlLabel 
                        control={
                            <Switch 
                                checked={formData.isActive}
                                onChange={handleToggleActive}
                            />
                        }
                        label="Active"
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} >Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};


export default EditUserDialog