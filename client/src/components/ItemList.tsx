import { Box, Typography } from "@mui/material";
import { IItem } from "../types/item.types";

// Components
import ItemCard from "./ItemCard";
import StockActionDialog from "./StockActionDialog";

// Hooks
import { useStockAction } from "../hooks/useStockAction";

import { logDebug, logInfo } from "../utils/logger";
import { useLocations } from '../hooks/useLocations';

interface ItemListProps {
    items: IItem[];
    onDelete?: (item: IItem) => void;
    onEdit?: (item: IItem) => void;
    onImageUpload?: (itemId: string, imageUrl: string) => void;
    refreshInventory: () => void;
    stockLookup?: Record<string, number>;
}

const ItemList = ({ items, onDelete, onEdit, onImageUpload, refreshInventory, stockLookup }: ItemListProps) => {

    logInfo("Loading ItemList ...")
    
    const { locations } = useLocations();

    const {
        dialogOpen,
        actionType,
        defaultLocation,
        localError: stockError,
        openDialog,
        closeDialog,
        submitAction
    } = useStockAction({ onSuccess: refreshInventory });

    logDebug('ItemList ->  locations', locations)
    logDebug('Items', items)
    
    return (
        <Box sx={{ width: '100%' }}>
            {items?.length > 0 ? (
                <Box 
                    sx={{ 
                        display: 'grid', 
                        // Responsive grid: 1 to 4 columns depending on screen width
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
                locations={locations}
                type={actionType}
                errorMessage={stockError}
                defaultLocation={defaultLocation}
            />
        </Box>
    );
};

export default ItemList;