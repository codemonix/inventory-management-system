import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { finalizeTransfer, createTransfer, loadTransfers, loadTempTransfer, confirmTransfer, clearTempTransferState } from "../redux/slices/transferSlice.js";
import TempTransferCard from "./TempTransferCard.jsx";
import FinalizedTransferCard from "./FinalizedTransferCard.jsx";
import StartTransferDialog from "./StartTransferDialog.jsx";
import { fetchLocations } from "../redux/slices/locationsSlice.js";
import { logDebug, logInfo } from "../utils/logger.js";
import { selectTempTransferDetailed } from "../redux/selectors/transferSelector.js";
import { loadAllItems } from "../redux/slices/itemsSlice.js";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import TransferItemsList from "./TransferItemsList.jsx";
import ConfirmModal from "./ConfirmModal.jsx";


const TransferList = () => {
    const { transfers, tempTransfer, transferStatus, tempTransferStatus } = useSelector((state) => state.transfer);
    const populatedTempTransfer = useSelector(selectTempTransferDetailed);
    const dispatch = useDispatch();
    const [showdialog, setShowdialog] = useState(false);
    const [openItems, setOpenItems] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);


    useEffect(() => {
        if (transferStatus === 'idle') {
            dispatch(loadTransfers());
            dispatch(loadTempTransfer());
        }
    }, [dispatch, transferStatus ]);

    useEffect(() => {
        dispatch(loadAllItems());
    },[])

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
        dispatch(fetchLocations());
    },[])

    const handleTransferConfirmDialog = ( transfer ) => {
        if (transfer.status !== 'confirmed') {
            setSelectedTransfer( transfer );
            setConfirmOpen(true)
        } else {
            logInfo("transfer already confirmed!")
        }
        logInfo("TransferList -> handleTransferConfirm -> ",transfer)
    };

    const handleConfirmTransfer = () => {
        dispatch(confirmTransfer(selectedTransfer));
        setConfirmOpen(false);
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
        if (tempTransfer?.items?.length > 0) {
            dispatch(finalizeTransfer()).then((result) => {
                if (finalizeTransfer.fulfilled.match(result)) {
                    return dispatch(clearTempTransferState())
                }
            }).then(() => dispatch(loadTransfers())).then(() => dispatch(loadTempTransfer()));
        }
    }

    const handleStartNewTransfer = ( fromLocation, toLocation ) => {
        dispatch(createTransfer({fromLocation, toLocation})).then(
            dispatch(loadTempTransfer())
        );

        setShowdialog(false);
    }

    logDebug("poppulatedTemp -> TransferList -> befor return:", populatedTempTransfer)
    logDebug("TransferList status:", transferStatus)

    return (
        <div className="p-1">
            <section className="mb-6">
                <h2 className="text-xl font-bold mb-2">Temporary Transfer (In progress)</h2>
            { tempTransferStatus === 'loading' ? (
                <>
                    <p className="text-gray-500 italic" >Loading temporary transfer ... </p>
                </>
            ) : !tempTransfer ? (
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
                        onConfirm={ () => handleTransferConfirmDialog(transfer)}
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