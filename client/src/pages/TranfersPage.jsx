import StatusHandler from "../components/StatusHandler.jsx";
import TransferList from "../components/TransferList.jsx";
import { useSelector } from "react-redux";
import { logDebug, logInfo } from "../utils/logger.js";


const TransfersPage = () => {
    const status = useSelector(( state ) => state.transfer.trasnferStatus);
    const error = useSelector(( state ) => state.transfer.error);
    logDebug("TransfersPage.jsx -> status:", status);
    logDebug("TransfersPage.jsx -> error:", error);
    logInfo("loading TransfersPage ...");

    return (
        <div className="p-2 bg-gray-400">
            <StatusHandler status={status} error={error} >
                <TransferList />
            </StatusHandler>
        </div>
    )
}

export default TransfersPage;