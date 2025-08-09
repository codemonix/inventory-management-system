import { Card, Box, Typography } from "@mui/material";
import { logDebug } from "../utils/logger";


export default function ItemCardTransfer ({item}) {
    logDebug("imageUrl:", item.item.imageUrl)
    return (
        <Card sx={{ m: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
            {item.item.imageUrl && (
                <Box 
                    component="img"
                    src={item.item.imageUrl}
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