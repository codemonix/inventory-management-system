import { useCallback, useEffect, useState, useMemo } from "react";
// 1. Using your Typed Hooks!
import { useAppDispatch, useAppSelector } from "../redux/hooks"; 
import { 
    loadTempTransfer, 
    createTempTransfer, 
    finalizeTransfer 
} from "../redux/thunks/transferThunks";
import { 
    getTransfers as loadTransfers, 
    confirmTransfer 
} from "../services/transferService";
import { getAllItems } from "../services/itemService";
import { clearTempTransferState } from "../redux/slices/transferSlice";
import { fetchLocations } from "../redux/slices/locationsSlice";
// Imports removed .js extensions!
import { selectTempTransferLocations, PopulatedTempTransfer } from "../redux/selectors/transferSelector";
import { logDebug, logError } from "../utils/logger";

// Types
import { IItem } from "../types/item.types";
import { ITransfer, ITempTransfer } from "../types/transfer.types";
import { ILocation } from "../types/location.types";

// ==========================================
// THE CONTRACT: What this hook returns
// ==========================================
export interface UseTransferManagerReturn {
    transfers: ITransfer[];
    tempTransfer: ITempTransfer | null;
    transferStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    tempTransferStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    populatedTempTransfer: PopulatedTempTransfer | null;
    isItemsLoading: boolean;
    startNewTransfer: (fromLocation: string, toLocation: string) => Promise<void>;
    finalizeCurrentTransfer: () => Promise<void>;
    confirmPastTransfer: (transferId: string) => Promise<void>;
}

export const useTransferManager = (): UseTransferManagerReturn => {
    const dispatch = useAppDispatch();
    
    // --- Redux State ---
    const tempTransferLocations = useAppSelector(selectTempTransferLocations);
    // Notice we don't need (state: RootState) anymore because useAppSelector handles it!
    const { data: tempTransfer, tempTransferStatus } = useAppSelector((state) => state.transfer);
    
    // --- Local State ---
    const [allItems, setAllItems] = useState<IItem[]>([]);
    const [isItemsLoading, setIsItemsLoading] = useState(false);
    const [transfers, setTransfers] = useState<ITransfer[]>([]);
    const [transferStatus, setTransferStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');

    // ==========================================
    // 1. EXTERNAL CATALOG FETCH
    // ==========================================
    useEffect(() => {
        // Renamed to fetchCatalog to avoid colliding with imported thunks
        const fetchCatalog = async () => {
            setIsItemsLoading(true);
            try {
                const response = await getAllItems();
                // Ensure this matches your service return structure (e.g., response.items vs response)
                setAllItems(response.items || response); 
            } catch (error: any) {
                logError("useTransferManager -> loading items failed", error.message);
            } finally {
                setIsItemsLoading(false);                
            }
        };
        fetchCatalog();
    }, []);

    // ==========================================
    // 2. THE DATA MERGE (Redux + API)
    // ==========================================
    logDebug("useTransferManager -> allItems: ", allItems);
    const fullyPopulatedTempTransfer = useMemo(() => {
        if (!tempTransferLocations) return null;

        if (allItems.length === 0) {
            return { ...tempTransferLocations, items: [] };
        }
        
        const itemsWithDetails = tempTransferLocations.items.map(({ itemId, quantity }) => {
            // FIX: Using _id instead of id to match MongoDB schema!
            const item = allItems.find((i) => i._id === itemId); 
            logDebug("useTransferManager -> item: ", item);
            return {
                itemId,
                quantity,
                name: item ? item.name : "Unknown Item",
                image: item?.imageUrl || null,
            };
        });

        return {
            fromLocation: tempTransferLocations.fromLocation,
            toLocation: tempTransferLocations.toLocation,
            items: itemsWithDetails,
        };
    }, [tempTransferLocations, allItems]);

    // ==========================================
    // 3. HISTORICAL TRANSFERS
    // ==========================================
    const loadHistoricalTransfers = useCallback(async () => {
        setTransferStatus('loading');
        try {
            const response = await loadTransfers();
            setTransfers(response);
            setTransferStatus('succeeded');
        } catch (error: any) {
            logError("useTransferManager -> loading transfers failed", error.message);
            setTransferStatus('failed');
        }
    }, []);

    // ==========================================
    // 4. INITIALIZATION EFFECT
    // ==========================================
    logDebug("useTransferManager -> tempTransferStatus: ", tempTransferStatus);
    logDebug("useTransferManager -> transferStatus: ", transferStatus);
    useEffect(() => {
        if (transferStatus === 'idle') {
            loadHistoricalTransfers();
        }
        if (tempTransferStatus === 'idle') {
            dispatch(fetchLocations());
            dispatch(loadTempTransfer());
        }
    }, [dispatch, transferStatus, tempTransferStatus, loadHistoricalTransfers]);

    // ==========================================
    // 5. MUTATIONS & ACTIONS
    // ==========================================
    const startNewTransfer = async (fromLocation: string, toLocation: string) => {
        await dispatch(createTempTransfer({ fromLocation, toLocation }));
        dispatch(loadTempTransfer());
    };

    const finalizeCurrentTransfer = async () => {
        if (tempTransfer?.items && tempTransfer.items.length > 0) {
            const result = await dispatch(finalizeTransfer());
            // Optional chaining protects against unhandled rejected promises
            if (finalizeTransfer.fulfilled.match(result)) {
                dispatch(clearTempTransferState());
                dispatch(loadTempTransfer());
                loadHistoricalTransfers();
            }
        }
    };

    // FIX: Typed transferId as string
    const confirmPastTransfer = async (transferId: string) => {
        try {
            // FIX: Removed `dispatch()`. This is a raw API service call, not a Redux thunk!
            await confirmTransfer(transferId); 
            loadHistoricalTransfers();
        } catch (error: any) {
            logError("Failed to confirm transfer", error.message);
        }
    };

    logInfo("useTransferManager -> populatedTempTransfer: ", fullyPopulatedTempTransfer)

    return {
        transfers,
        tempTransfer,
        transferStatus,
        tempTransferStatus,
        populatedTempTransfer: fullyPopulatedTempTransfer,
        isItemsLoading, // Added this so your UI can display a spinner while the catalog loads!
        startNewTransfer,
        finalizeCurrentTransfer,
        confirmPastTransfer
    };
};