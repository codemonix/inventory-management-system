import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    loadTempTransfer,
    createTempTransfer,
    finalizeTransfer,
    removeItem,
    discardTransfer,
} from "../redux/thunks/transferThunks";
import { getItemsByIds } from "../services/itemService";
import { clearTempTransferState } from "../redux/slices/transferSlice";
import { useLocations } from "./useLocations";
import { selectTempTransferLocations } from "../redux/selectors/transferSelector";
import { logDebug, logError } from "../utils/logger";

// Types
import { IItem } from "../types/item.types";
import { ILocation } from "../types/location.types";
import { ITempTransfer } from "../types/transfer.types";

export interface DraftTransferLine {
    itemId: string;
    quantity: number;
    name: string;
    image: string | null;
}

export interface PopulatedDraftTransfer {
    fromLocation: ILocation | undefined;
    toLocation: ILocation | undefined;
    items: DraftTransferLine[];
}

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// ==========================================
// THE CONTRACT: What this hook returns
// ==========================================
export interface UseTransferManagerReturn {
    tempTransfer: ITempTransfer | null;
    tempTransferStatus: LoadStatus;
    populatedTempTransfer: PopulatedDraftTransfer | null;
    isItemsLoading: boolean;
    startNewTransfer: (fromLocation: string, toLocation: string) => Promise<void>;
    // Resolves true when the draft became a real transfer
    finalizeCurrentTransfer: () => Promise<boolean>;
    // Both return the reserved stock to the source shelf
    removeDraftItem: (itemId: string) => Promise<void>;
    discardDraft: () => Promise<void>;
    // Last failed user action (start/finalize/remove/discard), shown by the UI
    actionError: string | null;
    setActionError: (message: string | null) => void;
}

// The current user's draft transfer. The finalized history lives in useTransferHistory.
export const useTransferManager = (): UseTransferManagerReturn => {
    const dispatch = useAppDispatch();

    // Location names for the draft card; loads them if no screen has yet
    useLocations();

    // --- Redux State ---
    const tempTransferLocations = useAppSelector(selectTempTransferLocations);
    const { data: tempTransfer, tempTransferStatus } = useAppSelector((state) => state.transfer);

    // --- Local State ---
    const [draftItems, setDraftItems] = useState<IItem[]>([]);
    const [isItemsLoading, setIsItemsLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    // ==========================================
    // 1. ITEM DETAILS (names and images for the draft lines only)
    // ==========================================
    // Stable key so the request only repeats when the set of draft items changes
    const draftItemIdsKey = (tempTransfer?.items ?? []).map((line) => line.itemId).sort().join(',');
    useEffect(() => {
        const ids = draftItemIdsKey ? draftItemIdsKey.split(',') : [];
        let cancelled = false;
        const fetchDraftItems = async () => {
            setIsItemsLoading(true);
            try {
                const items = await getItemsByIds(ids);
                if (!cancelled) setDraftItems(items);
            } catch (error: unknown) {
                logError("useTransferManager -> loading items failed", error instanceof Error ? error.message : error);
            } finally {
                if (!cancelled) setIsItemsLoading(false);
            }
        };
        void fetchDraftItems();
        return () => { cancelled = true; };
    }, [draftItemIdsKey]);

    // ==========================================
    // 2. THE DATA MERGE (Redux + API)
    // ==========================================
    const fullyPopulatedTempTransfer = useMemo<PopulatedDraftTransfer | null>(() => {
        if (!tempTransferLocations) return null;

        const itemsWithDetails = tempTransferLocations.items.map(({ itemId, quantity }) => {
            const item = draftItems.find((i) => i._id === itemId);
            return {
                itemId,
                quantity,
                name: item ? item.name : (isItemsLoading ? "Loading..." : "Unknown Item"),
                image: item?.imageUrl || null,
            };
        });

        return {
            fromLocation: tempTransferLocations.fromLocation,
            toLocation: tempTransferLocations.toLocation,
            items: itemsWithDetails,
        };
    }, [tempTransferLocations, draftItems, isItemsLoading]);

    // ==========================================
    // 3. INITIALIZATION EFFECT
    // ==========================================
    logDebug("useTransferManager -> tempTransferStatus: ", tempTransferStatus);
    useEffect(() => {
        if (tempTransferStatus === 'idle') {
            dispatch(loadTempTransfer());
        }
    }, [dispatch, tempTransferStatus]);

    // ==========================================
    // 4. MUTATIONS & ACTIONS
    // ==========================================
    const startNewTransfer = async (fromLocation: string, toLocation: string) => {
        const result = await dispatch(createTempTransfer({ fromLocation, toLocation }));
        if (createTempTransfer.rejected.match(result)) {
            setActionError(result.payload ?? "Failed to start transfer.");
        }
        dispatch(loadTempTransfer());
    };

    const finalizeCurrentTransfer = async (): Promise<boolean> => {
        if (!tempTransfer?.items || tempTransfer.items.length === 0) return false;
        const result = await dispatch(finalizeTransfer());
        if (finalizeTransfer.fulfilled.match(result)) {
            dispatch(clearTempTransferState());
            dispatch(loadTempTransfer());
            return true;
        }
        setActionError(result.payload ?? "Failed to finalize transfer.");
        return false;
    };

    const removeDraftItem = async (itemId: string) => {
        const result = await dispatch(removeItem(itemId));
        if (removeItem.rejected.match(result)) {
            setActionError(result.payload ?? "Failed to remove item from transfer.");
        }
    };

    const discardDraft = async () => {
        const result = await dispatch(discardTransfer());
        if (discardTransfer.rejected.match(result)) {
            setActionError(result.payload ?? "Failed to discard transfer.");
        }
    };

    return {
        tempTransfer,
        tempTransferStatus,
        populatedTempTransfer: fullyPopulatedTempTransfer,
        isItemsLoading,
        startNewTransfer,
        finalizeCurrentTransfer,
        removeDraftItem,
        discardDraft,
        actionError,
        setActionError,
    };
};
