import { Card, Box, Typography } from "@mui/material";


export default function ItemCardTransfer ({item}) {
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
                {/* <Typography variant="caption" sx={{ ml: 1}}>
                    Qty: {item.quantity}
                </Typography> */}
        </Card>
    )
}