import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone'
import OutputTwoTone from '@mui/icons-material/OutputTwoTone'
import imageCompressor from "browser-image-compression";
import ImageWithCameraOver from "./ImageWithCameraOver";
import { useState, useEffect } from "react";
import api from "../api/api";
import { logDebug, logError, logInfo } from "../utils/logger";
import { fetshItemImage } from "../services/itemsService";
import { useObjectImage } from "../hooks/useObjectImage.js";




const defaultImage = "/uploads/items/default.jpg"; // Placeholder image URL
// const backendUrl = `${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}`;

const ItemCard = ({ item, onIn, onOut, onDelete, onEdit, onImageUpload, totalStock }) => {
    // eslint-disable-next-line no-unused-vars
    // const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    logInfo("item", item);
    logInfo("totalStock", totalStock( item._id))
    const imageUrl = useObjectImage(item.imageUrl, fetshItemImage);
    // useEffect(() => {
    //     let objectUrl;
    //     const getItemImage = async () => {
    //         try {
    //             objectUrl = await fetshItemImage(item.imageUrl);
    //             setImageUrl(objectUrl);
    //         } catch (error) {
    //             logError("Image load failed:", error.message);
    //         }
    //     }
    //     getItemImage();

    //     return () => {
    //         if (objectUrl) {
    //             URL.revokeObjectURL(objectUrl);
    //         }
    //     };
        
    // }, [item.imageUrl]);

    const handleImageChange = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                setLoading(true);
                const compressedFile = await compressImage(file);

                    try {
                        const formData = new FormData();
                        formData.append("image", compressedFile);
                        formData.append("itemCode", item.code);
                        const response = await api.post(`/items/${item._id}/update-image`, formData);
                        const newImageUrl = `/uploads/${response.data.filename}`;

                        setImage(newImageUrl);

                        if (onImageUpload) {
                            onImageUpload(item._id, newImageUrl);
                        }
                    } catch (error) {
                        logError("Error uploading image:", error.message);
                    } finally {
                        setLoading(false);
                    }
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
                console.error("Error compressing image:", error.message);
                return file; // Return the original file if compression fails
            }
        };

    
    return (
        <Card sx={{ display: "flex",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    minHeight: 100,
                    maxWidth: 450,
                    minWidth: 350,
                    m: 0.75,
                     }} >
            <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <CardContent sx={{ flex: "1 0 auto", p: 1 , pb: 0}}>
                    <Typography variant="h7" >{ item.name }</Typography>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                        <Box sx={{ minWidth: "125px" }}>
                            <Typography variant="body2" color="text.secondary" >
                                { item.code? `#: ${item.code}` : "" }
                            </Typography>
                        </Box>
                        {item.price && (
                            <Box sx={{ minWidth: "90px" }} >
                                <Typography variant="body2" color="text.secondary" >
                                    <strong>Price:</strong> {item.price} €
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ minWidth: "50px" }} >
                            <Typography variant="body2" color="text.secondary" >
                               <strong>Qty: </strong>{ totalStock(item._id) }
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>

                <Box sx={{ display: "flex", gap: 1, px: 1, pb: 1 }}>
                    <IconButton onClick={(e) => onEdit(item, e.currentTarget)} color="Primary" aria-label="edit">
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
            
            { item.imageUrl && (
                <ImageWithCameraOver imageUrl={imageUrl} onChange={handleImageChange} />
            )}
            {loading && ( <div>Loading...</div>)}
        </Card>
    );
};

export default ItemCard;