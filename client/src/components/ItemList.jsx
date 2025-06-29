import ItemCard from "./ItemCard.jsx";
import { useEffect, useState } from "react";
import StockActionDialog from "./stockActionDialog.jsx";
import { stockIn, stockOut } from "../services/inventoryServices.js";
import { useDispatch, useSelector } from "react-redux";
import { logDebug, logError, logInfo } from "../utils/logger.js";
import { fetchLocations } from "../redux/slices/locationsSlice.js";
import { fetchFullInventory } from "../services/inventoryServices.js";

const ItemList = ({ items, onDelete, onEdit, onImageUpload }) => {
    const [actionType, setActionType] = useState('IN')
    const [openInOutDialog, setOpenInOutDialog] = useState(false)
    const [currentItemId, setCurrentItemId] = useState(null)
    const [inventory, setInventory] = useState([])
    const [triggerUpdate, setTriggerUpdate] = useState(0)
    

    const dispatch = useDispatch()
    // dispatch(fetchLocations())
    const locations = useSelector((state) => state.locations.locations)
    useEffect (() => {
        fetchFullInventory().then(setInventory).catch((error) => logError(error.message))
        // dispatch(fetchInventory())
        dispatch(fetchLocations())
    },[dispatch, triggerUpdate])


    logInfo('locations', locations)
    logDebug('Items', items)
    const handleInOutClick = (itemId, type) => {
        setActionType(type)
        setCurrentItemId(itemId)
        setOpenInOutDialog(true)
    }

    const handleSubmit = async ({ locationId, quantity}) => {
        logInfo("itemId, locationId:", currentItemId, locationId);
        try {
            if (actionType === 'IN') {
                await stockIn (currentItemId, locationId, quantity);
            } else if (actionType === 'OUT') {
                await stockOut (currentItemId, locationId, quantity)
            }
        } catch (error) {
            logError(error.message);
        } finally {
            handleClose();
            setTriggerUpdate((prev) => prev + 1)
        }

    }

    const getTotalStock = (itemId) => {
        const match = inventory.filter(
            (entry) => entry.itemId === itemId
        );
        
        if (match.length === 0) return 0;
        // logDebug('match', match)
        // logDebug('match.stock', match[0].stock)
        const total = match[0].stock.reduce((sum, entry) => sum + entry.quantity, 0)
        return total
    }

    const handleClose = () => {
        setOpenInOutDialog(false)
    }
    
    return (
        <div className=" p-2">
            { items.map((item) => (
                <ItemCard key={item._id} 
                    item={item} 
                    onDelete={onDelete} 
                    onEdit={onEdit}
                    onIn={() => handleInOutClick(item._id, 'IN')}
                    onOut={() => handleInOutClick(item._id, 'OUT')}
                    onImageUpload={onImageUpload}
                    totalStock = {() => getTotalStock(item._id)}
                    sx={{ mb: 2, p: 2 }} />
            ))}
            {(items.length === 0) && (
                <div className="text-center text-gray-500 mt-4">
                    No items found.
                </div>
            )}
            <StockActionDialog
                open={openInOutDialog}
                onClose={handleClose}
                onSubmit={handleSubmit}
                locations={locations}
                type={actionType}
                />
        </div>
    );

};

export default ItemList;