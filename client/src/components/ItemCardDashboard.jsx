import { Card, Typography, IconButton, Skeleton, Box, Stack, Divider } from "@mui/material";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoToneIcon from '@mui/icons-material/OutputTwoTone';
import SwapHorizonIcon from '@mui/icons-material/SwapHoriz';
import StockDetails from "./StockDetail";
import ImageWithCameraOver from "./ImageWithCameraOver.jsx";
import { useManagedImage } from "../hooks/useManagedObjectImage.js";
import { fetchItemImage } from "../services/itemService.js";

const defaultImage = "/uploads/items/default.jpg"; 

const ItemCardDashboard = ({ item, onIn, onOut, locationColors, onAddToTransfer, locations }) => {
    const { displayUrl, isImageLoading } = useManagedImage(item.image, fetchItemImage, defaultImage);

    return (
        <Card 
            elevation={0} // We use borders instead of heavy shadows for a modern, flat look
            sx={{ 
                display: 'flex', 
                width: '100%', 
                border: '1px solid', 
                borderColor: 'divider', // Dark Mode compliant
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper', // Dark Mode compliant
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 3 } // Subtle lift on hover
            }}
        >
            {/* 1. LEFT COLUMN: Anchored Image */}
            <Box sx={{ 
                width: 130, // Fixed width thumbnail
                flexShrink: 0, 
                position: 'relative', 
                bgcolor: 'action.hover',
                borderRight: '1px solid',
                borderColor: 'divider'
            }}>
                {isImageLoading ? (
                    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position: 'absolute', inset: 0 }} />
                ) : (
                    <ImageWithCameraOver 
                        imageUrl={displayUrl} 
                        readOnly={true} 
                        // Ensures the image covers the box perfectly without stretching
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
                    />
                )}
            </Box>

            {/* 2. RIGHT COLUMN: Details & Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 1.5 }}>
                
                {/* Header: Name and Code */}
                <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {item.name}
                    </Typography>
                    {/* Restored Semantic Label */}
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                        Code: {item.code || 'N/A'}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 1 }} />

                {/* Body: Stock Indicators */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <StockDetails item={item} locationColors={locationColors} direction="row" locations={locations} />
                </Box>

                {/* Footer: Action Buttons */}
                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                    <IconButton 
                        onClick={onIn} 
                        color="primary" 
                        sx={{ bgcolor: 'action.hover' }} // Slight background makes the hit-area obvious
                        title="Stock In"
                    >
                        <InputTwoToneIcon />
                    </IconButton>
                    <IconButton 
                        onClick={onOut} 
                        color="error" 
                        sx={{ bgcolor: 'action.hover' }}
                        title="Stock Out"
                    >
                        <OutputTwoToneIcon />
                    </IconButton>
                    <IconButton 
                        onClick={onAddToTransfer} 
                        color="secondary" 
                        sx={{ bgcolor: 'action.hover' }}
                        title="Transfer Stock"
                    >
                        <SwapHorizonIcon />
                    </IconButton>
                </Stack>
            </Box>
        </Card>
    );
};

export default ItemCardDashboard;