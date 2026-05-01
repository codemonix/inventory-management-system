import { useState } from "react";
import { useTransferManager } from "../hooks/useTransferManager";
import { Dialog, DialogContent, DialogTitle, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

// Sub-components
import ActiveTransferSection from "./ActiveTransferSection.jsx";
import TransferHistorySection from "./TransferHistorySection.jsx";
import StartTransferDialog from "./StartTransferDialog.jsx";
import TransferItemsList from "./TransferItemsList.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

import { logDebug, logInfo } from "../utils/logger";

const TransferList = () => {
    logDebug(" Loading TransferList component...");

    // Data & Logic from Custom Hook (100% UNTOUCHED)
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
        <Box sx={{ maxWidth: 'lg', mx: 'auto', p: { xs: 1, md: 3 }, display: 'flex', flexDirection: 'column', gap: 5 }}>
            
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
                <DialogTitle 
                    sx={{ 
                        borderBottom: '1px solid', 
                        borderColor: 'divider', 
                        bgcolor: 'background.default', 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        justifyContent: 'space-between', 
                        alignItems: { xs: 'flex-start', sm: 'center' }, 
                        gap: 1.5, 
                        py: 2, 
                        pr: 6, // Padding for the absolute close button
                        position: 'relative' 
                    }}
                >
                    
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                        Transfer {selectedTransfer?._id ? `#${selectedTransfer._id.slice(-6)}` : 'Details'}
                    </Typography>
                    
                    {/* The Location Badge Header */}
                    {(selectedTransfer?.fromLocation || selectedTransfer?.toLocation) && (
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                typography: 'subtitle2', 
                                fontWeight: 600, 
                                color: 'text.primary', 
                                bgcolor: 'background.paper', 
                                border: '1px solid', 
                                borderColor: 'divider', 
                                px: 1.5, 
                                py: 0.75, 
                                borderRadius: '50px', 
                                boxShadow: 1 
                            }}
                        >
                            <Typography noWrap sx={{ maxWidth: 100, fontSize: 'inherit', fontWeight: 'inherit' }} title={selectedTransfer.fromLocation?.name}>
                                {selectedTransfer.fromLocation?.name || 'Unknown'}
                            </Typography>
                            <Box component="span" sx={{ mx: 1, color: 'primary.main', fontSize: '1.125rem', lineHeight: 1 }}>→</Box>
                            <Typography noWrap sx={{ maxWidth: 100, fontSize: 'inherit', fontWeight: 'inherit' }} title={selectedTransfer.toLocation?.name}>
                                {selectedTransfer.toLocation?.name || 'Unknown'}
                            </Typography>
                        </Box>
                    )}

                    {/* Close Button */}
                    <IconButton 
                        onClick={() => setOpenItems(false)}
                        size="small"
                        aria-label="Close modal"
                        sx={{ 
                            position: 'absolute', 
                            top: 16, 
                            right: 16, 
                            color: 'text.secondary', 
                            bgcolor: 'background.paper', 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            boxShadow: 1, 
                            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } 
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>

                </DialogTitle>
                
                {/* Transfer Items List */} 
                <DialogContent sx={{ bgcolor: 'background.default', pt: 2, pb: 1 }}>
                    <Box sx={{ pt: 2, pb: 1 }}>
                        <TransferItemsList 
                            items={selectedTransfer?.items || []} 
                            onDelete={() => {}} 
                            onEdit={() => {}} 
                            onConfirm={() => {}} 
                        />
                    </Box>
                </DialogContent>
            </Dialog>

            <ConfirmModal 
                open={confirmOpen}
                title='Confirm Arrival'
                message={`Are you sure the items have arrived at ${selectedTransfer?.toLocation?.name || 'their destination'}?`}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
            />
            
        </Box>
    );
};

export default TransferList;