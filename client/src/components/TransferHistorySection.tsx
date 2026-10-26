import { useEffect, useRef, useState } from "react";
import { Paper, Typography, Box, useTheme, useMediaQuery, Stack, CircularProgress, Alert, Button } from "@mui/material";
import FinalizedTransferCard from "./FinalizedTransferCard";
import TransfersDataGrid from "./TransfersDataGrid";
import TransferHistoryFilters from "./TransferHistoryFilters";
import { EMPTY_TRANSFER_FILTERS } from "../utils/transferStatus";
import ConfirmModal from "./ConfirmModal";
import { useTransferHistory } from "../hooks/useTransferHistory";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { ITransfer, TransferHistoryFilters as Filters } from "../types/transfer.types";

interface TransferHistorySectionProps {
    onViewItems: (transfer: ITransfer) => void;
    // Only managers and admins may confirm arrivals (the server enforces this too)
    canConfirm: boolean;
    // Only admins may cancel an in-transit transfer (the server enforces this too)
    canCancel: boolean;
    // Bumped by the parent (e.g. after finalizing a draft) to reload from the first page
    refreshKey: number;
    onError: (message: string) => void;
}

const TransferHistorySection = ({ onViewItems, canConfirm, canCancel, refreshKey, onError }: TransferHistorySectionProps) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    const [filters, setFilters] = useState<Filters>(EMPTY_TRANSFER_FILTERS);
    const { transfers, total, hasMore, isLoading, isLoadingMore, error, loadMore, reload, confirm, cancel } = useTransferHistory(filters);

    const [toConfirm, setToConfirm] = useState<ITransfer | null>(null);
    const [toCancel, setToCancel] = useState<ITransfer | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const sentinelRef = useInfiniteScroll<HTMLDivElement>(loadMore, {
        enabled: hasMore && !isLoading && !isLoadingMore && !error,
        watch: transfers.length,
    });

    // Reload when the parent signals new data (skip the initial mount, the hook already loads)
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        reload();
    }, [refreshKey, reload]);

    const handleConfirm = async () => {
        if (!toConfirm) return;
        setIsConfirming(true);
        try {
            await confirm(toConfirm._id);
            setToConfirm(null);
        } catch (err: unknown) {
            onError(err instanceof Error ? err.message : 'Failed to confirm transfer.');
            setToConfirm(null);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancel = async () => {
        if (!toCancel) return;
        setIsConfirming(true);
        try {
            await cancel(toCancel._id);
        } catch (err: unknown) {
            onError(err instanceof Error ? err.message : 'Failed to cancel transfer.');
        } finally {
            setToCancel(null);
            setIsConfirming(false);
        }
    };

    const openConfirm = canConfirm
        ? (transfer: ITransfer) => { if (transfer.status === 'in_transit') setToConfirm(transfer); }
        : undefined;
    const openCancel = canCancel
        ? (transfer: ITransfer) => { if (transfer.status === 'in_transit') setToCancel(transfer); }
        : undefined;

    return (
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Transfer History</Typography>
                {!isLoading && (
                    <Typography variant="body2" color="text.secondary">
                        {transfers.length} of {total}
                    </Typography>
                )}
            </Box>

            <TransferHistoryFilters value={filters} onChange={setFilters} />

            {isLoading ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={32} />
                </Box>
            ) : transfers.length === 0 && !error ? (
                <Box sx={{ py: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">No transfers match these filters.</Typography>
                </Box>
            ) : isDesktop ? (
                <TransfersDataGrid
                    transfers={transfers}
                    onViewItems={onViewItems}
                    onConfirm={openConfirm}
                    onCancel={openCancel}
                />
            ) : (
                <Stack spacing={2}>
                    {transfers.map((transfer) => (
                        <FinalizedTransferCard
                            key={transfer._id}
                            transfer={transfer}
                            onViewItems={() => onViewItems(transfer)}
                            onConfirm={openConfirm && (() => openConfirm(transfer))}
                            onCancel={openCancel && (() => openCancel(transfer))}
                        />
                    ))}
                </Stack>
            )}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mt: 2 }}
                    action={<Button color="inherit" size="small" onClick={transfers.length ? loadMore : reload}>Retry</Button>}
                >
                    {error}
                </Alert>
            )}

            {/* Scrolling this into view loads the next page */}
            <Box ref={sentinelRef} sx={{ height: 1 }} />
            {isLoadingMore && (
                <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                </Box>
            )}
            {!isLoading && !hasMore && transfers.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                    All transfers loaded
                </Typography>
            )}

            <ConfirmModal
                open={Boolean(toConfirm)}
                title="Confirm Arrival"
                message={`Are you sure the items have arrived at ${toConfirm?.toLocation?.name || 'their destination'}?`}
                onClose={() => setToConfirm(null)}
                onConfirm={handleConfirm}
                confirmLabel="Confirm Arrival"
                confirmColor="success"
                isSubmitting={isConfirming}
            />

            <ConfirmModal
                open={Boolean(toCancel)}
                title="Cancel Transfer"
                message={`Cancel this transfer? All items go back to ${toCancel?.fromLocation?.name || 'the source location'}. This cannot be undone.`}
                onClose={() => setToCancel(null)}
                onConfirm={handleCancel}
                confirmLabel="Cancel Transfer"
                confirmColor="error"
                isSubmitting={isConfirming}
            />
        </Paper>
    );
};

export default TransferHistorySection;
