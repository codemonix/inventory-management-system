import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";

// Components
import ItemCard from "./ItemCard.jsx";
import StockActionDialog from "./StockActionDialog.jsx";

// Hooks
import { useStockAction } from "../hooks/useStockAction.js";

import { logDebug, logInfo } from "../utils/logger.js";

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

    logDebug('ItemList.jsx ->  locations', locations)
    logDebug('Items', items)
    
    return (
        <Box sx={{ width: '100%' }}>
            {items?.length > 0 ? (
                <Box 
                    sx={{ 
                        display: 'grid', 
                        // 👇 Responsive grid guarantees cards align perfectly into columns
                        gridTemplateColumns: { 
                            xs: '1fr', 
                            sm: 'repeat(2, 1fr)', 
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        }, 
                        gap: 2, // Standardizes the spacing between cards to 16px
                        p: 1
                    }}
                >
                    {items.map((item) => (
                        <Box key={item._id} sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
                            <ItemCard 
                                item={item} 
                                onDelete={onDelete} 
                                onEdit={onEdit}
                                onIn={() => openDialog({ itemId: item._id }, 'IN')}
                                onOut={() => openDialog({ itemId: item._id}, 'OUT')}
                                onImageUpload={onImageUpload}
                                totalStock={stockLookup ? stockLookup[item._id] || 0 : 0} 
                            />
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box sx={{ py: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default', mt: 2 }}>
                    <Typography variant="body1" color="text.secondary" fontWeight="medium">
                        No items found.
                    </Typography>
                </Box>
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