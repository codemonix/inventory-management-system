// src/components/TransferList.jsx
import { useState } from "react";
import { useTransferManager } from "../hooks/useTransferManager.js";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

// Sub-components
import ActiveTransferSection from "./ActiveTransferSection.jsx";
import TransferHistorySection from "./TransferHistorySection.jsx";
import StartTransferDialog from "./StartTransferDialog.jsx";
import TransferItemsList from "./TransferItemsList.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

const TransferList = () => {
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
        confirmPastTransfer(selectedTransfer);
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
                <DialogTitle className="border-b bg-gray-50">
                    Items for Transfer {selectedTransfer?._id ? `#${selectedTransfer._id.slice(-6)}` : ''}
                </DialogTitle>
                <DialogContent>
                    <div className="py-4">
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