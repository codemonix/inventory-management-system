import { Card, Box, Typography } from "@mui/material";
import { logDebug } from "../utils/logger";
import { fetchItemImage } from "../services/itemsService.js";
import { useManagedImage } from "../hooks/useManagedObjectImage.js";


export default function ItemCardTransfer ({item}) {
    logDebug("ItemCardTransfer.jsx -> imageUrl:", item.item.imageUrl)
    const imageObjUrl = useManagedImage( item.item.imageUrl, fetchItemImage );

    return (
        <Card sx={{ m: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
            {item.item.imageUrl && (
                <Box 
                    component="img"
                    src={imageObjUrl}
                    alt={item.item.name}
                    sx={{ width: 150, height: 150, objectFit: "cover", borderRadius: 0.5, mr: 1}} 
                />
            )}
                <Box sx={{ flexGrow: 1}} >
                    <Typography variant="bodu2" noWrap>
                        {item.item.name} : {item.quantity}
                    </Typography>
                </Box>
        </Card>
    )
}