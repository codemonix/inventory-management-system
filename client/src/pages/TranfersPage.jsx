import StatusHandler from "../components/StatusHandler.jsx";
import TransferList from "../components/TransferList.jsx";
import { useSelector, useDispatch } from "react-redux";
import { logDebug } from "../utils/logger.js";
import { useEffect } from "react";
import { loadAllItems } from "../redux/slices/itemsSlice.js";




const TransfersPage = () => {
    // const state = useSelector((state) => state)
    // logDebug("state:", state)
    const status = useSelector(( state ) => state.transfer.trasferStatus);
    const error = useSelector(( state ) => state.transfer.error);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(loadAllItems());
    }, [dispatch]);
    logDebug("status:", status)
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Transfers</h1>
            <p className="mb-4">Manage your transfers between locations.</p>
            <StatusHandler status={status} error={error} >
                <TransferList />
            </StatusHandler>
        </div>
    )
}

export default TransfersPage;