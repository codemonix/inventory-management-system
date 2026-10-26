import { Card, Box, Typography, Chip, Button, Stack, Divider } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ITransfer } from "../types/transfer.types";
import { transferStatusColor, transferStatusLabel } from "../utils/transferStatus";

interface FinalizedTransferCardProps {
    transfer: ITransfer;
    onViewItems: () => void;
    // Omitted for users who may not confirm (only managers and admins can)
    onConfirm?: () => void;
    // Omitted for non-admins (only admins can cancel)
    onCancel?: () => void;
}

const FinalizedTransferCard = ({ transfer, onViewItems, onConfirm, onCancel }: FinalizedTransferCardProps) => {
    const { fromLocation, toLocation, status, _id, items = [], createdAt } = transfer;
    const isConfirmed = status === 'confirmed';
    const isOpen = status === 'in_transit';

    return (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">{fromLocation?.name || 'N/A'}</Typography>
                            <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="subtitle2" fontWeight="bold" color="primary.main">{toLocation?.name || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={transferStatusLabel(status)} color={transferStatusColor(status)} size="small" sx={{ fontWeight: 'bold' }} />
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">ID: {_id.slice(-6)}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {new Date(createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={onViewItems} sx={{ flex: 1, borderRadius: 2 }}>
                        View Items
                    </Button>
                    {onConfirm && (
                        <Button 
                            variant="contained" 
                            color={isConfirmed ? "success" : "primary"}
                            size="small" 
                            onClick={onConfirm}
                            disabled={!isOpen}
                            sx={{ flex: 1, borderRadius: 2 }}
                        >
                            {isConfirmed ? 'Confirmed' : isOpen ? 'Confirm' : 'Cancelled'}
                        </Button>
                    )}
                    {onCancel && isOpen && (
                        <Button 
                            variant="outlined" 
                            color="error"
                            size="small" 
                            onClick={onCancel}
                            sx={{ flex: 1, borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                    )}
                </Stack>
            </Box>

            {items.length > 0 && (
                <>
                    <Divider />
                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Manifest</Typography>
                        <Stack spacing={0.5}>
                            {items.slice(0, 3).map((line, index) => (
                                <Box key={line.item?._id ?? index} sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">{line.item?.name ?? 'Deleted item'}</Typography>
                                    <Typography variant="body2" fontWeight="bold">x{line.quantity}</Typography>
                                </Box>
                            ))}
                            {items.length > 3 && (
                                <Typography variant="caption" color="primary.main" fontStyle="italic" sx={{ mt: 1 }}>
                                    +{items.length - 3} more items...
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </>
            )}
        </Card>
    );
};

export default FinalizedTransferCard;
