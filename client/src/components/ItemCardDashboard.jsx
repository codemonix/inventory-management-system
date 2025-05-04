import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
} from "@mui/material";
import StockDetails from "./StockDetail";
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoToneIcon from '@mui/icons-material/OutputTwoTone';

const ItemCardDashboard = ({ item, onIn, onOut, locationColors }) => {
    console.log("ItemCardDashboard -> item", item.image);
    
    return (
        <Card sx={{ display: "flex",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    height: 100,
                    m: 1,
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
                    </Box> 
                     </Box>
                </CardContent>
                <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1 }}>
                    <StockDetails item={item} locationColors={locationColors} />
                </Box>

                
            </Box>
            { item.image && (
                <Box 
                component="img"
                src={item.image}
                alt={item.name}
                sx={{ width: 100, height: "100%", objectFit: "cover", borderRadius: 1, ml: 1 }}/>
            )}
            
        </Card>
    );
};

export default ItemCardDashboard;