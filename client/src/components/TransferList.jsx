import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { finalizeTransfer, createTransfer, loadTransfers, loadTempTransfer, confirmTransfer } from "../redux/slices/transferSlice.js";
import TempTransferCard from "./TempTransferCard.jsx";
import FinalizedTransferCard from "./FinalizedTransferCard.jsx";
import StartTransferDialog from "./StartTransferDialog.jsx";
import { fetchLocations } from "../redux/slices/locationsSlice.js";
import { logDebug, logInfo } from "../utils/logger.js";
import { selectTempTransferDetailed } from "../redux/selectors/transferSelector.js";
import { loadItems } from "../redux/slices/itemsSlice.js";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import TransferItemsList from "./TransferItemsList.jsx";
import ConfirmModal from "./ConfirmModal.jsx";





const TransferList = () => {
    const { transfers, tempTransfer, status } = useSelector((state) => state.transfer);
    // const status = useSelector(( state ) => state.transfer.status)
    // const { items } = useSelector((state) => state.items);
    const populatedTempTransfer = useSelector(selectTempTransferDetailed);
    const locations = useSelector((state) => state.locations.locations);
    const dispatch = useDispatch();
    const [showdialog, setShowdialog] = useState(false);
    const [openItems, setOpenItems] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        dispatch(loadItems());
        dispatch(fetchLocations());
        if (status === 'idle') {
            dispatch(loadTransfers());
            dispatch(loadTempTransfer());
        }
    }, [dispatch, status ]);

    useEffect (() => {
        logInfo("TransferList populatedTempTransfer:", populatedTempTransfer)
    }, [populatedTempTransfer]);

    useEffect(() => {
        logInfo("TransferList transfers:", transfers)
    }, [transfers]);

    useEffect(() => {
        logInfo("TransferList tempTransfer:", tempTransfer)
    }, [tempTransfer])

    useEffect(() => {
        logInfo("TransferList locations:", locations)
    }, [locations])

    const handleTransferConfirm = ( transfer ) => {
        if (transfer.status !== 'confirmed') {
            setSelectedTransfer( transfer );
            setConfirmOpen(true)
        } else {
            logInfo("transfer already confirmed!")
        }
        console.log("TransferList -> handleTransferConfirm -> ",transfer)
    };

    const handleConfirmTransfer = () => {
        dispatch(confirmTransfer(selectedTransfer));
    }


    const handleOpenItems = (transfer) => {
        setSelectedTransfer(transfer);
        setOpenItems(true);
    };

    const handleCloseItems = () => {
        setOpenItems(false);
        setSelectedTransfer(null);
    }

    const handleFinalize = () => {
        if (tempTransfer.items.length > 0) {
            dispatch(finalizeTransfer());
            dispatch(loadTransfers)
        }
    }

    const handleStartNewTransfer = ( fromLocation, toLocation ) => {
        dispatch(createTransfer({fromLocation, toLocation}));
        setShowdialog(false);
    }

    logDebug("poppulatedTemp -> TransferList -> befor return:", populatedTempTransfer)
    logDebug("TransferList status:", status)

    return (
        <div className="p-4">
            <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Temporary Transfer (In progress)</h2>
            { !populatedTempTransfer || !populatedTempTransfer.fromLocation ? (
                <>
                    <p className="text-gray-500 italic" >Loading temporary transfer ... </p>
                </>
            ) : populatedTempTransfer.items.length === 0 ? (
                <>
                    <p className="text-gray-500 italic">No active transfer in progress.</p>
                    <button onClick={() => setShowdialog(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" >
                        Start New Transfer
                    </button>
                </>
            ) : (
                   <TempTransferCard populatedTempTransfer={populatedTempTransfer} 
                        onFinalize={handleFinalize} />
            )}
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Finalized Transfers</h2>
                {transfers.length === 0 ? (
                    <p className="text-gray-500 italic">No finalized transfers available.</p>
                ) : (
                 transfers.map((transfer) => (
                    <FinalizedTransferCard key={ transfer._id } transfer={ transfer } onViewItems={ () => handleOpenItems(transfer) }
                        onConfirm={ () => handleTransferConfirm(transfer)}
                    />
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

            { openItems && (
                <Dialog open={openItems} onClose={handleCloseItems} fullWidth maxWidth="md" >
                    <DialogTitle>Items in Transfer</DialogTitle>
                    <DialogContent >
                        { selectedTransfer && (
                            <TransferItemsList items={selectedTransfer.items} 
                                onDelete={ () => {}}
                                onEdit={ () => {}}
                                onConfirm={ () => {}} />
                        )}
                    </DialogContent>
                </Dialog>
            )}
            <ConfirmModal 
                open={confirmOpen}
                title='Confirm Transfer'
                message='Are you sure the items have arrived at the destinaion?'
                onClose={ () => setConfirmOpen(false)}
                onConfirm={handleConfirmTransfer}
            />
            
        </div>
    );
};

export default TransferList;