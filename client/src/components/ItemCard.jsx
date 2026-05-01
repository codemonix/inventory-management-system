import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Skeleton,
    Snackbar,
    Alert,
    Box,
    Stack,
    Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoToneIcon from '@mui/icons-material/OutputTwoTone';

import ImageWithCameraOver from "./ImageWithCameraOver";
import { fetchItemImage } from "../services/itemService";
import { useManagedImage } from "../hooks/useManagedObjectImage";
import { useImageUpload } from "../hooks/useImageUpload";

const defaultImage = "/uploads/items/default.jpg"; 

const ItemCard = ({ item, onIn, onOut, onDelete, onEdit, onImageUpload, totalStock }) => {
    
    const { displayUrl, setLocalPreview, isImageLoading } = useManagedImage(
        item.imageUrl,
        fetchItemImage,
        defaultImage
    );

    const { isUploading, uploadError, clearError, triggerImageUpload } = useImageUpload({
        onSuccess: onImageUpload,
        setLocalPreview: setLocalPreview
    });

    return (
        <Card 
            elevation={0} 
            sx={{ 
                width: '100%', 
                mb: 2, // Replaces rigid margins with standard MUI bottom margin
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'row', // Horizontal layout for better scanning
                overflow: 'hidden'
            }}
        >
            {/* 1. IMAGE COLUMN (Fixed Left Side) */}
            <Box 
                sx={{ 
                    width: 120, // Slightly smaller than dashboard for lists
                    flexShrink: 0,
                    position: 'relative',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'action.hover'
                }}
            >
                { isImageLoading ? (
                    <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                ) : (
                    <ImageWithCameraOver 
                        imageUrl={displayUrl}
                        onChange={() => triggerImageUpload(item.code, item._id, displayUrl)}
                    />
                )}
                
                {isUploading && (
                    <Box sx={{ 
                        position: 'absolute', inset: 0, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        bgcolor: 'rgba(255,255,255,0.7)', 
                        zIndex: 10, typography: 'caption', fontWeight: 'bold' 
                    }}>
                        Uploading...
                    </Box>
                )}
            </Box>

            {/* 2. DATA & ACTIONS COLUMN (Flex Right Side) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                
                <CardContent sx={{ p: 1.5, pb: 0, flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5 }}>
                        { item.name }
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                        Code: { item.code || 'N/A' }
                    </Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                            {item.price ? `€${item.price}` : "--"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Stock: <Box component="span" sx={{ fontWeight: 'bold', color: totalStock === 0 ? 'error.main' : 'text.primary' }}>{totalStock}</Box>
                        </Typography>
                    </Stack>
                </CardContent>

                <Divider sx={{ mt: 1 }} />

                {/* Actions Footer */}
                <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    sx={{ p: 1, bgcolor: 'action.hover' }} // Slight background difference for the action bar
                >
                    <Box>
                        <IconButton 
                            size="small"
                            onClick={(e) => onEdit(item, e.currentTarget)} 
                            color="primary" 
                            title="Edit Item"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDelete(item)} color="error" title="Delete Item">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box>
                        <IconButton size="small" onClick={onIn} color="primary" title="Stock In" aria-label="stock-in">
                            <InputTwoToneIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={onOut} color="error" title="Stock Out" aria-label="stock-out">
                            <OutputTwoToneIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Stack>
            </Box>

            <Snackbar 
                open={Boolean(uploadError)} 
                autoHideDuration={6000}     
                onClose={clearError}        
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
                    {uploadError}
                </Alert>
            </Snackbar>
        </Card>
    );
};

export default ItemCard;