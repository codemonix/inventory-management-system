import { useAuth } from "../context/AuthContext";
import { Box, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { logDebug } from "../utils/logger";

export default function LocationList({ locations, onDelete, onUpdate }) {
    const { isAdmin, isManager } = useAuth();
    const isAdminOrManager = isAdmin || isManager; 

    if (!locations || locations.length === 0) {
        return (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No locations found. Add one above to get started.
            </Typography>
        );
    }
    logDebug("LocationList -> locations:", locations);

    return (
        <Stack spacing={2}>
            {locations.map((location) => (
                <Box 
                    key={location._id} 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 2,
                        bgcolor: 'action.hover' 
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* THE SLEEK COLOR PICKER */}
                        <Tooltip title={!isAdminOrManager ? "Admin/Manager access required" : "Change Color"}>
                            <Box
                                component="input"
                                type="color"
                                defaultValue={location.color || '#cccccc'}
                                disabled={!isAdminOrManager}
                                onChange={(e) => {
                                    const newColor = e.target.value;
                                    // 2. The event fires when they finalize the pick
                                    if (newColor !== location.color) {
                                        logDebug(`Updating location ${location._id} to color: ${newColor}`);
                                        onUpdate(location._id, { color: newColor });
                                    }
                                }}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    p: 0,
                                    border: 'none',
                                    borderRadius: '50%',
                                    cursor: isAdminOrManager ? 'pointer' : 'not-allowed',
                                    // CSS Magic to hide the ugly browser default color-picker styling
                                    '&::-webkit-color-swatch-wrapper': { p: 0 },
                                    '&::-webkit-color-swatch': { border: 'none', borderRadius: '50%' },
                                    '&::-moz-color-swatch': { border: 'none', borderRadius: '50%' }
                                }}
                            />
                        </Tooltip>
                        
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            { location.name }
                        </Typography>
                    </Box>
                    
                    <Tooltip title={!isAdminOrManager ? "Admin/Manager access required" : "Delete Location"}>
                        <span> 
                            <IconButton 
                                color="error" 
                                onClick={() => onDelete(location._id)}
                                disabled={!isAdminOrManager}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            ))}
        </Stack>
    );
}