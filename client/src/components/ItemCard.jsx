import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Skeleton,
    Snackbar,
    Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoTone from '@mui/icons-material/OutputTwoTone';

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
        <Card className="flex justify-between items-stretch min-h-[150px] sm:min-h-[100px] w-full max-w-[450px] m-1.5">
            
            {/* Main Info Area */}
            <div className="flex flex-col grow">
                <CardContent className="flex-[1_0_auto] p-2 pb-0">
                    <Typography variant="subtitle1" className="font-bold">{ item.name }</Typography>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="min-w-[125px]">
                            <Typography variant="body2" color="text.secondary">
                                { item.code ? `#: ${item.code}` : "" }
                            </Typography>
                        </div>
                        
                        <div className="flex gap-2">
                            <div className="min-w-[90px]">
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Price:</strong> {item.price || "--"} €
                                </Typography>
                            </div>
                            <div className="min-w-[50px]">
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Qty: </strong>{ totalStock }
                                </Typography>
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* Action Buttons */}
                <div className="flex gap-2 px-2 pb-2">
                    <IconButton onClick={(e) => onEdit(item, e.currentTarget)} color="primary" aria-label="edit">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(item)} color="error" aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
                    <IconButton onClick={onIn} color="primary" aria-label="stock-in">
                        <InputTwoToneIcon />
                    </IconButton>
                    <IconButton onClick={onOut} color="error" aria-label="stock-out">
                        <OutputTwoTone />
                    </IconButton>
                </div>
            </div>

            {/* Image and loading container */}
            <div className="relative flex items-center justify-center w-[150px] sm:w-[100px] h-[150px] sm:h-[100px] shrink-0">
                { isImageLoading ? (
                    <Skeleton 
                        variant="rectangular"
                        animation="wave"
                        className="w-full h-full"
                    />
                ) : (
                    <ImageWithCameraOver 
                        imageUrl={displayUrl}
                        onChange={() => triggerImageUpload(item.code, item._id, displayUrl)}
                    />
                )}
                
                {/* Upload Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 font-bold text-xs z-10">
                        Uploading...
                    </div>
                )}
            </div>

            {/* Error handling */}
            <Snackbar 
                open={Boolean(uploadError)} 
                autoHideDuration={6000}     
                onClose={clearError}        
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={clearError} severity="error" className="w-full">
                    {uploadError}
                </Alert>
            </Snackbar>
        </Card>
    );
};

export default ItemCard;