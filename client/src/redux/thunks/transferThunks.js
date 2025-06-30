import { logError } from "../../utils/logger";
import { loadTransfers, loadTempTransfer } from "../slices/transferSlice.js";

export const refetchTransfrs = async (dispatch) => {
    try {
        await dispatch(loadTransfers()).unwrap();
        await dispatch(loadTempTransfer()).unwrap();
    } catch (error) {
        logError("Refetching transfers failed:", error.message)
    }
};

