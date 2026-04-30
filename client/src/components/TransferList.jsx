
import { useState } from "react";
import { useTransferManager } from "../hooks/useTransferManager";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

// Sub-components
import ActiveTransferSection from "./ActiveTransferSection.jsx";
import TransferHistorySection from "./TransferHistorySection.jsx";
import StartTransferDialog from "./StartTransferDialog.jsx";
import TransferItemsList from "./TransferItemsList.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

import { logDebug, logInfo } from "../utils/logger";

const TransferList = () => {
    logDebug(" Loading TransferList component...");

    // Data & Logic from Custom Hook
    const { 
        transfers, tempTransfer, tempTransferStatus, populatedTempTransfer, 
        startNewTransfer, finalizeCurrentTransfer, confirmPastTransfer 
    } = useTransferManager();

    // UI State for Modals
    const [showStartDialog, setShowStartDialog] = useState(false);
    const [openItems, setOpenItems] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    // Handlers
    const handleStartNew = async (fromLocation, toLocation) => {
        await startNewTransfer(fromLocation, toLocation);
        setShowStartDialog(false);
    };

    const handleConfirm = () => {
        confirmPastTransfer(selectedTransfer._id);
        setConfirmOpen(false);
    };

    const handleOpenItems = (transfer) => {
        setSelectedTransfer(transfer);
        setOpenItems(true);
    };

    const handleOpenConfirmDialog = (transfer) => {
        if (transfer.status !== 'confirmed') {
            setSelectedTransfer(transfer);
            setConfirmOpen(true);
        }
    };

    logDebug("TransferList -> tempTransfer:", tempTransfer);
    logDebug("TransferList -> tempTransferStatus:", tempTransferStatus);
    logDebug("TransferList -> populatedTempTransfer:", populatedTempTransfer);


    return (
        <div className="max-w-5xl mx-auto p-2 md:p-6 space-y-10">
            
            <ActiveTransferSection 
                tempTransfer={tempTransfer}
                tempTransferStatus={tempTransferStatus}
                populatedTempTransfer={populatedTempTransfer}
                onStartNew={() => setShowStartDialog(true)}
                onFinalize={finalizeCurrentTransfer}
            />

            <TransferHistorySection 
                transfers={transfers}
                onViewItems={handleOpenItems}
                onConfirmDialog={handleOpenConfirmDialog}
            />

            {/* --- Modals & Dialogs --- */}
            
            {showStartDialog && (
                <StartTransferDialog
                    open={showStartDialog}
                    onClose={() => setShowStartDialog(false)}
                    onStartNewTransfer={handleStartNew}
                />
            )}

            <Dialog open={openItems} onClose={() => setOpenItems(false)} fullWidth maxWidth="sm">
                <DialogTitle className="border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-4 pr-12 relative">
                    
                    <span className="font-bold text-gray-500 text-sm">
                        Transfer {selectedTransfer?._id ? `#${selectedTransfer._id.slice(-6)}` : 'Details'}
                    </span>
                    
                    {/* The Location Badge Header */}
                    {(selectedTransfer?.fromLocation || selectedTransfer?.toLocation) && (
                        <div className="flex items-center text-sm font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                            <span className="truncate max-w-[100px]" title={selectedTransfer.fromLocation?.name}>
                                {selectedTransfer.fromLocation?.name || 'Unknown'}
                            </span>
                            <span className="mx-2 text-blue-500 text-lg leading-none">→</span>
                            <span className="truncate max-w-[100px]" title={selectedTransfer.toLocation?.name}>
                                {selectedTransfer.toLocation?.name || 'Unknown'}
                            </span>
                        </div>
                    )}

                    {/* Close Button */}
                    <button 
                        onClick={() => setOpenItems(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 p-1.5 rounded-full shadow-sm transition-colors"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                </DialogTitle>
                
                {/* Transfer Items List */} 
                <DialogContent className="bg-gray-50/30">
                    <div className="pt-4 pb-2">
                        <TransferItemsList 
                            items={selectedTransfer?.items || []} 
                            onDelete={() => {}} 
                            onEdit={() => {}} 
                            onConfirm={() => {}} 
                        />
                    </div>
                </DialogContent>
            </Dialog>
            <ConfirmModal 
                open={confirmOpen}
                title='Confirm Arrival'
                message={`Are you sure the items have arrived at ${selectedTransfer?.toLocation?.name || 'their destination'}?`}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
            />
            
        </div>
    );
};

export default TransferList;