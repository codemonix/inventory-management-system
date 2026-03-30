
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    loadTransfers, loadTempTransfer, createTransfer, 
    finalizeTransfer, clearTempTransferState, confirmTransfer 
} from "../redux/slices/transferSlice.js";
import { fetchLocations } from "../redux/slices/locationsSlice.js";
import { loadAllItems } from "../redux/slices/itemsSlice.js";
import { selectTempTransferDetailed } from "../redux/selectors/transferSelector.js";

export const useTransferManager = () => {
    const dispatch = useDispatch();

    const { transfers, tempTransfer, transferStatus, tempTransferStatus } = useSelector((state) => state.transfer);
    const populatedTempTransfer = useSelector(selectTempTransferDetailed);

    useEffect(() => {
        if (transferStatus === 'idle') {
            dispatch(loadTransfers());
            dispatch(loadTempTransfer());
            dispatch(loadAllItems());
            dispatch(fetchLocations());
        }
    }, [dispatch, transferStatus]);

    const startNewTransfer = async (fromLocation, toLocation) => {
        await dispatch(createTransfer({ fromLocation, toLocation }));
        dispatch(loadTempTransfer());
    };

    const finalizeCurrentTransfer = async () => {
        if (tempTransfer?.items?.length > 0) {
            const result = await dispatch(finalizeTransfer());
            if (finalizeTransfer.fulfilled.match(result)) {
                dispatch(clearTempTransferState());
                dispatch(loadTransfers());
                dispatch(loadTempTransfer());
            }
        }
    };

    const confirmPastTransfer = (transfer) => {
        dispatch(confirmTransfer(transfer));
    };

    return {
        transfers,
        tempTransfer,
        transferStatus,
        tempTransferStatus,
        populatedTempTransfer,
        startNewTransfer,
        finalizeCurrentTransfer,
        confirmPastTransfer
    };
};