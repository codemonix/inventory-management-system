import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const ItemCard = ({ item, onDelete, onEdit }) => {
    // console.log("ItemCard -> item", item);
    
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
                sx={{ width: 100, height: "100%", objectFit: "cover", borderRadius: 1, ml: 1 }}/>
            )}
            
        </Card>
    );
};

export default ItemCard;