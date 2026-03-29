import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Skeleton,
    Snackbar,
    Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone'
import OutputTwoTone from '@mui/icons-material/OutputTwoTone'


import ImageWithCameraOver from "./ImageWithCameraOver";
import { fetchItemImage } from "../services/itemsService";
import { useManagedImage } from "../hooks/useManagedObjectImage";
import { useImageUpload } from "../hooks/useImageUpload";

import { logDebug, logInfo } from "../utils/logger";


const defaultImage = "/uploads/items/default.jpg"; // Placeholder image URL

const ItemCard = ({ item, onIn, onOut, onDelete, onEdit, onImageUpload, totalStock }) => {
    
    logInfo("ItemCard loading...")
    logDebug("item", item);
    logDebug("totalStock", totalStock)
    
    const { displayUrl, setLocalPreview, isImageLoading } = useManagedImage(
        item.imageUrl,
        fetchItemImage,
        defaultImage
    );

    const { isUploading, uploadError, clearError, triggerImageUpload } = useImageUpload({
        onSuccess: onImageUpload,
        setLocalPreview: setLocalPreview
    });

    logDebug("ItemCard.jsx -> displayUrl:", displayUrl);

    
    return (
        <Card sx={{ display: "flex",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    minHeight: {
                        xs: 150,
                        sm: 100
                    },
                    maxWidth: 450,
                    minWidth: 350,
                    m: 0.75,
                    }} >
            <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <CardContent sx={{ flex: "1 0 auto", p: 1 , pb: 0}}>
                    <Typography variant="h7" >{ item.name }</Typography>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                        <Box sx={{ minWidth: "125px" }}>
                            <Typography variant="body2" color="text.secondary" >
                                { item.code? `#: ${item.code}` : "" }
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Box sx={{ minWidth: "90px" }} >
                                <Typography variant="body2" color="text.secondary" >
                                    <strong>Price:</strong> {item.price || "--"} €
                                </Typography>
                            </Box>
                            <Box sx={{ minWidth: "50px" }} >
                                <Typography variant="body2" color="text.secondary" >
                                <strong>Qty: </strong>{ totalStock }
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>

                <Box sx={{ display: "flex", gap: 1, px: 1, pb: 1 }}>
                    <IconButton onClick={(e) => onEdit(item, e.currentTarget)} color="primary" aria-label="edit">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(item)} color="error" aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
                    <IconButton onClick={onIn} color="primary" aria-label="stock-in">
                        <InputTwoToneIcon />
                    </IconButton>
                    <IconButton onClick={onOut} color="error" aria-label="stock-out" >
                        <OutputTwoTone />
                    </IconButton>
                </Box>
            </Box>
            {/* Image and loading container */}
            <Box sx={{
                position: "relative", 
                display: "flex",
                alignItems: "center", 
                justifyContent: "center",
                width: {
                    xs: 150,
                    sm: 100
                },
                height: {
                    xs: 150,
                    sm: 100
                }
            }}
            >
                { isImageLoading ? (
                    <Skeleton 
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        animation="wave"
                    />
                ) : (
                    <ImageWithCameraOver 
                        imageUrl={displayUrl}
                        onChange={() => triggerImageUpload(item.code, item._id, displayUrl)}
                    />
                )}
                {isUploading && (
                    <Box sx={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "rgba(255,255,255, 0.7)",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        zIndex: 10
                    }}
                    >
                        Uploading...
                    </Box>
                )}
            </Box>
            {/* Error handling */}
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