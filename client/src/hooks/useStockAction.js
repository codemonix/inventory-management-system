import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../redux/slices/transferSlice.js";
import { stockIn, stockOut } from "../services/inventoryServices.js";
import { logDebug } from "../utils/logger.js";

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
        setLocalError(""); // Clear any previous errors

        if (type === 'TRANSFER') {
            // Optional chaining prevents crashes if tempTransfer isn't loaded yet
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
                    if (onSuccess) onSuccess(); // Trigger data refresh
                    break;

                case 'OUT':
                    await stockOut(currentItemId, locationId, quantity);
                    if (onSuccess) onSuccess(); // Trigger data refresh
                    break;

                case 'TRANSFER':
                    // Validate that the selected location matches the active transfer's source
                    if (tempTransfer?.fromLocation && tempTransfer.fromLocation !== locationId) {
                        setLocalError("Location mismatch! Please select the correct source location.");
                        return; // Stop execution, keep dialog open
                    }
                    dispatch(addItem({ itemId: currentItemId, quantity, sourceLocationId: locationId }));
                    break;

                default:
                    console.warn(`Unknown action type: ${actionType}`);
            }

            closeDialog(); // Only close if the try block succeeds without returning early

        } catch (err) {
            logDebug("Error in useStockAction -> submitAction:", err);
            setLocalError(err.message || "An error occurred while processing the stock action.");
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