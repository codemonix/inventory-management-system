import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../redux/thunks/transferThunks.js";
import { stockIn, stockOut } from "../services/inventoryServices.js";
import { logError, logWarning } from "../utils/logger.js";

/**
 * Custom hook to handle inventory stock actions (IN, OUT, TRANSFER).
 * * @param {Object} options - Configuration options.
 * @param {Function} options.onSuccess - Callback triggered after a successful stock action.
 */
export const useStockAction = ({ onSuccess }) => {
    const dispatch = useDispatch();

    // Redux state needed for validation
    const tempTransfer = useSelector((state) => state.transfer.tempTransfer);

    // Local state for the dialog and actions
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [actionType, setActionType] = useState('IN');
    const [defaultLocation, setDefaultLocation] = useState(null);
    const [localError, setLocalError] = useState("");

    // Opens the dialog and prepares the state based on the action type
    const openDialog = (item, type) => {
        setCurrentItemId(item.itemId);
        setActionType(type);
        setDialogOpen(true);
        setLocalError(""); 

        if (type === 'TRANSFER') {
            setDefaultLocation(tempTransfer?.fromLocation || null);
        } else {
            setDefaultLocation(null);
        }
    };

    // Resets state and closes the dialog
    const closeDialog = () => {
        setDialogOpen(false);
        setLocalError("");
        setCurrentItemId(null);
    };

    // The core business logic for handling the submit
    const submitAction = async (locationId, quantity) => {
        setLocalError(""); // Clear previous errors before attempting

        try {
            switch (actionType) {
                case 'IN':
                    await stockIn(currentItemId, locationId, quantity);
                    break;

                case 'OUT':
                    await stockOut(currentItemId, locationId, quantity);
                    break;

                case 'TRANSFER':
                    // Validate that the selected location matches the active transfer's source
                    if (tempTransfer?.fromLocation && tempTransfer.fromLocation !== locationId) {
                        logWarning("Location mismatch!");
                        setLocalError("Location mismatch! Please select the correct source location.");
                        return false; // Stop execution, keep dialog open
                    }
                    await dispatch(addItem({ itemId: currentItemId, quantity, sourceLocationId: locationId })).unwrap();
                    break;
                    
                    default:
                        logWarning( "Unknown action type:", actionType);
                        setLocalError("Unknown action type.");
                        return false;
                    }
                    
            if (onSuccess) onSuccess(); 
            closeDialog(); // Only close if the try block succeeds without returning early
            return true;

        } catch (err) {
            logError("Error in useStockAction -> submitAction:", err);
            const errorMessage = typeof err === 'string' ? err : (err.message || "An error occurred.");
            setLocalError(errorMessage);
            return false;
        }
    };

    return {
        dialogOpen,
        currentItemId,
        actionType,
        defaultLocation,
        localError,
        openDialog,
        closeDialog,
        submitAction
    };
};