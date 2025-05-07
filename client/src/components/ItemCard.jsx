import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import imageCompressor from "browser-image-compression";
// import axios from "axios";
import { useState } from "react";
import api from "../api/api";

const defaultImage = "/uploads/items/default.jpg"; // Placeholder image URL

const ItemCard = ({ item, onDelete, onEdit, onImageUpload }) => {
    const [image, setImage] = useState(item.imageUrl || defaultImage);
    const [loading, setLoading] = useState(false);
    console.log("ItemCard -> item", item);
    console.log("ItemCard -> item.imageUrl, image", item.imageUrl, image);

    const handleImageChange = () => {
        console.log("ItemCard -> handleImageChange -> item", item.code);
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
                        console.log("ItemCard -> handleImageChange -> formData", Object.fromEntries(formData.entries()));
                        const response = await api.post(`/items/${item._id}/update-image`, formData);
                        console.log("ItemCard -> handleImageChange -> response", response.data);
                        const newImageUrl = `/uploads/${response.data.filename}`;

                        setImage(newImageUrl);

                        if (onImageUpload) {
                            onImageUpload(item._id, newImageUrl);
                        }
                    } catch (error) {
                        console.error("Error uploading image:", error.message);
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
                    height: 100,
                    m: 1,
                     }} >
            <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <CardContent sx={{ flex: "1 0 auto", p: 1 }}>
                    <Typography variant="h7" >{ item.name }</Typography>
                    <Typography variant="body2" color="text.secondary" >
                        { item.code? `Code: ${item.code}` : "" }
                    </Typography>   
                    <Typography variant="body2" color="text.secondary" >
                        { item.description }
                    </Typography>
                </CardContent>

                <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1 }}>
                    <IconButton onClick={onEdit} color="Primary" >
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(item)} color="error" >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </Box>
            
            { item.imageUrl && (
                <Box 
                component="img"
                src={item.imageUrl}
                alt={item.name}
                onDoubleClick={handleImageChange}
                sx={{ width: 100, height: "100%", objectFit: "cover", borderRadius: 1, ml: 1, cursor: "pointer" }}/>
                
            )}
            {loading && ( <div>Loading...</div>)}
        </Card>
    );
};

export default ItemCard;