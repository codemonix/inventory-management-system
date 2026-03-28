import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Skeleton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone'
import OutputTwoTone from '@mui/icons-material/OutputTwoTone'
import imageCompressor from "browser-image-compression";
import ImageWithCameraOver from "./ImageWithCameraOver";
import { useState } from "react";
import api from "../api/api";
import { logDebug, logError, logInfo } from "../utils/logger";
import { fetchItemImage } from "../services/itemsService";
import { useManagedImage } from "../hooks/useManagedObjectImage";




const defaultImage = "/uploads/items/default.jpg"; // Placeholder image URL

const ItemCard = ({ item, onIn, onOut, onDelete, onEdit, onImageUpload, totalStock }) => {
    const [uploading, setUploading] = useState(false);

    logInfo("item", item);
    logInfo("totalStock", totalStock)
    
    const { displayUrl, setLocalPreview, isImageLoading } = useManagedImage(
        item.imageUrl,
        fetchItemImage,
        defaultImage
    );
    

    const handleImageChange = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            const compressedImage = await compressImage(file);

            setLocalPreview(compressedImage);

            try {
                const formData = new FormData();
                formData.append("image", compressedImage);
                formData.append("itemCode", item.code);

                const response = await api.post(`/items/${item._id}/update-image`, formData);
                if (onImageUpload) {
                    onImageUpload(item._id, `/uploads/${response.data.filename}`);
                }
            } catch (error) {
                logError("Upload Failed", error.message);
            } finally {
                setUploading(false);
            }

            };
            input.click();  
        };

        const compressImage = async (file) => {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            try {
                const compressedBlob = await imageCompressor(file, options);
                const compressedFile = new File([compressedBlob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                });
                return compressedFile
            } catch (error) {
                logError("Error compressing image:", error.message);
                return file; // Return the original file if compression fails
            }
        };

        logDebug("ItemCard.jsx -> displayUrl:", displayUrl)
    
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
                            onChange={handleImageChange}
                        />
                    )}
            </Box>
            {uploading && (
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
        </Card>
    );
};

export default ItemCard;