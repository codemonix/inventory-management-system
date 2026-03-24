import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Skeleton,
} from "@mui/material";
import StockDetails from "./StockDetail";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoToneIcon from '@mui/icons-material/OutputTwoTone';
import SwapHorizonIcon from '@mui/icons-material/SwapHoriz';
import { useManagedImage } from "../hooks/useManagedObjectImage.js";
import ImageWithCameraOver from "./ImageWithCameraOver.jsx";
import { logDebug } from "../utils/logger.js";
import { fetchItemImage } from "../services/itemsService.js";

const defaultImage = "/uploads/items/default.jpg"; // Placeholder image URL

const ItemCardDashboard = ({ item, onIn, onOut, locationColors, onAddToTransfer }) => {

    const { displayUrl, isImageLoading } = useManagedImage(
        item.image,
        fetchItemImage,
        defaultImage
    );

    logDebug("ItemCardDashboard.jsx -> displayUrl:", displayUrl);
    logDebug("ItemCardDashboard.jsx -> item:", item);

    return (
        <Card sx={{ display: "flex",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    minHeight: 100,
                    maxWidth: 450,
                    minWidth: 350,
                    m: 0.75,
                    }} >
            <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
                <CardContent sx={{ flex: "1", p: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, height: '100%' }}>

                    <Typography variant="h7">{ item.name }</Typography> 
                    <Box justifyContent="flex-end" alignSelf="flex-start" sx={{ display: "flex", mt: 'auto' }}>
                        <IconButton onClick={onIn} color="primary" >
                            <InputTwoToneIcon />
                        </IconButton>
                        <IconButton onClick={onOut} color="error" >
                            <OutputTwoToneIcon />
                        </IconButton>
                        <IconButton onClick={onAddToTransfer} color="secondary" >
                            <SwapHorizonIcon />
                        </IconButton>
                    </Box> 
                    </Box>
                </CardContent>
                <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1 }}>
                    <StockDetails item={item} locationColors={locationColors} />
                </Box>
            </Box>
            {/* Image */}
            { isImageLoading ? (
                <Skeleton 
                    variant="rectangular"
                    width={100}
                    height={100}
                    animation="wave"
                    sx={{ borderRadius: 1 }}
                />
            ) : (
                <ImageWithCameraOver 
                    imageUrl={displayUrl}
                    readOnly={true}
                />
            )}
        </Card>
    );
};

export default ItemCardDashboard;