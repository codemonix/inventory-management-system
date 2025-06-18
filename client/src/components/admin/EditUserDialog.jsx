import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateUserDetails } from "../../redux/thunks/userThunks.js";

const EditUserDialog = ({ open, onClose, user }) => {
    const dispatch = useDispatch();
    const { isAdmin, isManager } = useAuth();
    const isAdminOrManager = isAdmin || isManager;

    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        isApproved: user.isApproved || false,
        isActive: user.isActive || false,
    });

    useEffect(() => {
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


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData( (prev) => ({ ...prev, [name]: value}));
    };

    const handleToggleActive = () => {
        setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleToggleApproved = () => {
        setFormData((prev) => ({ ...prev, isApproved: !prev.isApproved }));
    };

    const handleSubmit = () => {
        dispatch(updateUserDetails({ id: user._id, ...formData }));
        onClose();
    };

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth >
            <DialogTitle >Edit User</DialogTitle>
            <DialogContent>
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
                    {[ "admin", "manager", "user" ].map( (role) => (
                        <MenuItem key={role} value={role}  >

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
                <Button onClick={handleSubmit} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};


export default EditUserDialog