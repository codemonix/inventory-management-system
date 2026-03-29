import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";

// Components
import ItemCard from "./ItemCard.jsx";
import StockActionDialog from "./StockActionDialog.jsx";

// Hooks
import { useStockAction } from "../hooks/useStockAction.js";


import { logDebug, logError, logInfo } from "../utils/logger.js";


const ItemList = ({ items, onDelete, onEdit, onImageUpload, refreshInventory, stockLookup }) => {

    logInfo("Loading ItemList ...")
    
    const locations = useSelector((state) => state.locations.locations);

    const {
        dialogOpen,
        currentItemId,
        actionType,
        defaultLocation,
        localError: stockError,
        openDialog,
        closeDialog,
        submitAction
    } = useStockAction({ onSuccess: refreshInventory });
    

    // // Optimization: MAP for inventory look up
    // const stockLookup = useMemo(() => {
    //     return inventory.reduce((acc, entry) => {
    //         const total = entry.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;
    //         const id = entry.itemId || entry._id;
    //         acc[id] = total;
    //         return acc;
    //     },{});
    // }, [inventory]);

    logDebug('ItemList.jsx ->  locations', locations)
    logDebug('Items', items)
    
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: 0, 
                p: 0
            }}
        >
            {items && items.length > 0 ? (
                items.map((item) => (
                    <ItemCard 
                        key={item._id} 
                        item={item} 
                        onDelete={onDelete} 
                        onEdit={onEdit}
                        onIn={() => openDialog({ itemId: item._id }, 'IN')}
                        onOut={() => openDialog({ itemId: item._id}, 'OUT')}
                        onImageUpload={onImageUpload}
                        totalStock={stockLookup ? stockLookup[item._id] || 0 : 0} 
                    />
                ))
            ) : (
                <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ mt: 2, width: '100%' }}
                >
                    No items found.
                </Typography>
            )}

            <StockActionDialog
                open={dialogOpen}
                onClose={closeDialog}
                onSubmit={submitAction}
                itemId={currentItemId}
                locations={locations}
                type={actionType}
                errorMessage={stockError}
                defaultLocation={defaultLocation}
            />
        </Box>
    );

};

export default ItemList;