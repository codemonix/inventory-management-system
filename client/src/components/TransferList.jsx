import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { finalizeTransfer, createTransfer, loadTransfers, loadTempTransfer } from "../redux/slices/transferSlice.js";
import TempTransferCard from "./TempTransferCard.jsx";
import FinalizedTransferCard from "./FinalizedTransferCard.jsx";
import StartTransferDialog from "./StartTransferDialog.jsx";
import { fetchLocations } from "../redux/slices/locationsSlice.js";
import StockActionDialog from "./stockActionDialog.jsx";
import { logInfo } from "../utils/logger.js";
import { selectTempTransferDetailed } from "../redux/selectors/transferSelector.js";
import { loadItems } from "../redux/slices/itemsSlice.js";




const TransferList = () => {
    const state = useSelector((state) => state);
    console.log("TransferList state: ", state);
    const { transfers, tempTransfer } = useSelector((state) => state.transfer);
    const { items } = useSelector((state) => state.items);
    const populatedTempTransfer = useSelector(selectTempTransferDetailed);
    // const { locations } = useSelector((state) => state.locations);
    // logInfo("TransferList transfers: ", transfers);
    // logInfo("TransferList tempTransfer: ", tempTransfer);
    const dispatch = useDispatch();
    const [showdialog, setShowdialog] = useState(false);

    useEffect(() => {
        dispatch(loadTransfers());
        dispatch(fetchLocations());
        dispatch(loadTempTransfer());
        dispatch(loadItems());
    }, [dispatch]);

    logInfo("TransferList transfers: ", transfers);
    logInfo("TransferList tempTransfer: ", tempTransfer);
    logInfo("TransferList items: ", items);
    logInfo("TransferList populatedTempTransfer: ", populatedTempTransfer);

    const handleFinalize = () => {
        if (tempTransfer.items.length > 0) {
            dispatch(finalizeTransfer());
        }
    }

    const handleStartNewTransfer = ( fromLocation, toLocation ) => {
        dispatch(createTransfer({fromLocation, toLocation}));
        setShowdialog(false);
    }

    return (
        <div className="p-4">
            <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Temporary Transfer (In progress)</h2>
            { populatedTempTransfer && populatedTempTransfer.items.length >= 0 ? (
                <TempTransferCard tempTransfer={populatedTempTransfer} onFinalize={handleFinalize} />
            ) : (
                <>
                    <p className="text-gray-500 italic">No active transfer in progress.</p>
                    <button onClick={() => setShowdialog(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" >
                        Start New Transfer
                    </button>
                </>
            )}
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Finalized Transfers</h2>
                {transfers.length === 0 ? (
                    <p className="text-gray-500 italic">No finalized transfers available.</p>
                ) : (
                 transfers.map((transfer) => (
                    <FinalizedTransferCard key={ transfer._id } transfer={ transfer } />
                ))
                )}
            </section>

            {showdialog && (
                <StartTransferDialog
                open={showdialog}
                onClose={() => setShowdialog(false)}
                onStartNewTransfer={handleStartNewTransfer}
                />
            )}
        </div>
    );
};

export default TransferList;