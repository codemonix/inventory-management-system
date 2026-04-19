import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Skeleton,
} from "@mui/material";
import StockDetails from "./StockDetail";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoToneIcon from '@mui/icons-material/OutputTwoTone';
import SwapHorizonIcon from '@mui/icons-material/SwapHoriz';
import { useManagedImage } from "../hooks/useManagedObjectImage.js";
import ImageWithCameraOver from "./ImageWithCameraOver.jsx";
import { logDebug } from "../utils/logger.js";
import { fetchItemImage } from "../services/itemServices.js";

const defaultImage = "/uploads/items/default.jpg"; 

const ItemCardDashboard = ({ item, onIn, onOut, locationColors, onAddToTransfer }) => {

    const { displayUrl, isImageLoading } = useManagedImage(
        item.image,
        fetchItemImage,
        defaultImage
    );

    logDebug("ItemCardDashboard.jsx -> displayUrl:", displayUrl);
    logDebug("ItemCardDashboard.jsx -> item:", item);

    return (
        <Card className="flex justify-between items-stretch min-h-[100px] w-full max-w-[450px] m-1.5">
            {/* Main Content Area */}
            <div className="flex flex-row grow">
                <CardContent className="flex-1 p-2">
                    <div className="flex flex-col grow h-full">
                        <Typography variant="subtitle1">{ item.name }</Typography> 
                        
                        <div className="flex justify-end self-start mt-auto">
                            <IconButton onClick={onIn} color="primary">
                                <InputTwoToneIcon />
                            </IconButton>
                            <IconButton onClick={onOut} color="error">
                                <OutputTwoToneIcon />
                            </IconButton>
                            <IconButton onClick={onAddToTransfer} color="secondary">
                                <SwapHorizonIcon />
                            </IconButton>
                        </div> 
                    </div>
                </CardContent>
                
                <div className="flex gap-2 px-4 pb-2">
                    <StockDetails item={item} locationColors={locationColors} />
                </div>
            </div>

            {/* Image Area */}
            <div className="relative flex basis-[30%] min-w-[100px] max-w-[150px] items-stretch justify-center overflow-hidden">
                { isImageLoading ? (
                    <Skeleton 
                        variant="rectangular"
                        animation="wave"
                        className="w-full h-full rounded absolute inset-0"
                    />
                ) : (
                    <ImageWithCameraOver 
                        imageUrl={displayUrl}
                        readOnly={true}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
        </Card>
    );
};

export default ItemCardDashboard;