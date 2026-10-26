import { useState } from "react";
import { Box, Card, Typography, Stack, Chip, Paper, Divider, Button, IconButton, Tooltip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { logDebug } from "../utils/logger";
import { PopulatedDraftTransfer } from "../hooks/useTransferManager";
import ConfirmModal from "./ConfirmModal";

interface TempTransferCardProps {
    populatedTempTransfer: PopulatedDraftTransfer | null;
    onFinalize: () => void;
    // Removing a line or discarding the draft returns that stock to the source shelf
    onRemoveItem: (itemId: string) => void;
    onDiscard: () => void;
}

const TempTransferCard = ({ populatedTempTransfer, onFinalize, onRemoveItem, onDiscard }: TempTransferCardProps) => {
    logDebug("TempTransferCard -> populatedTempTransfer:", populatedTempTransfer);
    const [confirmDiscard, setConfirmDiscard] = useState(false);

    const fromLocation = populatedTempTransfer?.fromLocation;
    const toLocation = populatedTempTransfer?.toLocation;
    const items = populatedTempTransfer?.items ?? [];

    const route = (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 0.5 }}>
            <Typography variant="body2" fontWeight="bold" color="text.primary">
                {fromLocation?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="error.main">→</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary.main">
                {toLocation?.name || 'N/A'}
            </Typography>
        </Stack>
    );

    const discardButton = (
        <Button
            color="inherit"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => (items.length > 0 ? setConfirmDiscard(true) : onDiscard())}
            // Keep icon and label on one line on narrow phones
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
            Discard draft
        </Button>
    );

    const discardModal = (
        <ConfirmModal
            open={confirmDiscard}
            title="Discard draft transfer?"
            message="All items in this draft go back to their source location."
            confirmLabel="Discard"
            onClose={() => setConfirmDiscard(false)}
            onConfirm={() => { setConfirmDiscard(false); onDiscard(); }}
        />
    );

    // Empty draft: show the route and allow discarding it
    if (items.length === 0) {
        return (
            <Box
                sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>{route}</Box>
                <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mt: 1 }}>
                    No items in temporary transfer. Add items from the dashboard.
                </Typography>
                <Box sx={{ mt: 1 }}>{discardButton}</Box>
                {discardModal}
            </Box>
        );
    }

    return (
        <Card
            elevation={0}
            sx={{
                maxWidth: 450,
                mx: 'auto',
                p: 2.5,
                border: '2px solid',
                borderColor: 'warning.light',
                // Subtle yellow tint in light mode, standard paper in dark mode
                bgcolor: (theme) => theme.palette.mode === 'light' ? '#fffdef' : 'background.paper',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 2 }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Box>
                    <Chip
                        label="DRAFT TRANSFER"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold', fontSize: '0.65rem', letterSpacing: 1, mb: 1 }}
                    />
                    {route}
                </Box>
                {discardButton}
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'warning.light',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }}
            >
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                    Items to Move
                </Typography>
                <Stack divider={<Divider flexItem />} spacing={0}>
                    {items.map((item) => (
                        <Box key={item.itemId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, gap: 1 }}>
                            <Typography variant="body2" fontWeight="medium" color="text.secondary" sx={{ flexGrow: 1 }}>
                                {item.name || "Unknown Item"}
                            </Typography>
                            <Box sx={{ bgcolor: 'action.hover', px: 1, py: 0.25, borderRadius: 1 }}>
                                <Typography variant="body2" fontFamily="monospace" color="text.primary">
                                    x{item.quantity}
                                </Typography>
                            </Box>
                            <Tooltip title="Remove from transfer (stock goes back)">
                                <IconButton
                                    size="small"
                                    aria-label={`Remove ${item.name} from transfer`}
                                    onClick={() => onRemoveItem(item.itemId)}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}
                </Stack>
            </Paper>

            <Button
                fullWidth
                variant="contained"
                color="warning"
                onClick={onFinalize}
                sx={{
                    fontWeight: 'bold',
                    py: 1.25,
                    borderRadius: 2,
                    boxShadow: 1
                }}
            >
                Finalize & Save Transfer
            </Button>
            {discardModal}
        </Card>
    );
};

export default TempTransferCard;
