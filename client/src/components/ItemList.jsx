import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ItemCard from "./ItemCard.jsx";
import StockActionDialog from "./StockActionDialog.jsx";
import { stockIn, stockOut, fetchFullInventory } from "../services/inventoryServices.js";
import { fetchLocations } from "../redux/slices/locationsSlice.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";
import { Box, Typography } from "@mui/material";

const ItemList = ({ items, onDelete, onEdit, onImageUpload }) => {
    const dispatch = useDispatch();
    const locations = useSelector((state) => state.locations.locations);

    
    const [inventory, setInventory] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogState, setDialogState] = useState({ 
        open: false, type: 'IN', itemId: null, error: '' });
    
    // load initial data
    useEffect (() => {
        logInfo("Loading Item List ...");

        const loadInitialData = async () => {
            try {
                const data = await fetchFullInventory();
                setInventory(data);
                dispatch(fetchLocations());
                logInfo("ItemList successfully loaded inventory and locations.");
            } catch (error) {
                logError("ItemList.jsx -> loadData -> error:", error.message);
            }
        }
        loadInitialData();
    }, [dispatch])

    // Optimization: MAP for inventory look up
    const stockLookup = useMemo(() => {
        return inventory.reduce((acc, entry) => {
            const total = entry.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;
            acc[entry.itemId] = total;
            return acc;
        },{});
    }, [inventory]);

    logDebug('ItemList.jsx ->  locations', locations)
    logDebug('Items', items)
    
    // handlers
    const handleActionOpen = (itemId, type) => {
        setDialogState({ open: true, type, itemId });
    };

    const handleClose = () => {
        setDialogState((prev) => ({ ...prev, open: false }));
    };

    const handleTransaction = async (locationId, quantity) => {
        const { itemId, type } = dialogState;
        logDebug("ItemList.jsx -> handleTransaction -> locationId:", locationId);

        setIsSubmitting(true);
        try {
            const action = type === 'IN' ? stockIn : stockOut;
            await action(itemId, locationId, quantity);
            const updatedInventory = await fetchFullInventory();
            setInventory(updatedInventory);
            logInfo(`Successfully processed stock ${type} for item ${itemId}`);
            handleClose();
        }  catch (error) {
            logError(`Transaction failed for stock ${type}:`, error.message);
            const displayMessage = error.userMessage 
                || error.response?.data?.message 
                || "Failed to process transaction. Please try again.";
            setDialogState((prev) => ({ ...prev, error: displayMessage }));
        } finally {
            setIsSubmitting(false);
        }
    };
    
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
                        onIn={() => handleActionOpen(item._id, 'IN')}
                        onOut={() => handleActionOpen(item._id, 'OUT')}
                        onImageUpload={onImageUpload}
                        totalStock={stockLookup[item._id] || 0} 
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
                open={dialogState.open}
                onClose={handleClose}
                onSubmit={handleTransaction}
                locations={locations}
                type={dialogState.type}
                isSubmitting={isSubmitting}
                externalError={dialogState.error}
            />
        </Box>
    );

};

export default ItemList;