import { Card, Box, Typography, Chip, Button, Stack, Divider } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { logDebug, logInfo } from "../utils/logger";

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending':
        case 'in_transit': return 'info';
        case 'confirmed': return 'success';
        default: return 'default';
    }
};

const FinalizedTransferCard = ({ transfer, onViewItems, onConfirm }) => {
    logDebug("FinalizedTransferCard.jsx -> transfer:", transfer);
    logInfo("loading FinalizedTransferCard ...");

    const { fromLocation, toLocation, status, _id, items = [] } = transfer;
    const isConfirmed = status === 'confirmed';

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
                            <Chip label={status || 'Unknown'} color={getStatusColor(status)} size="small" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }} />
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">ID: {_id?.slice(-6)}</Typography>
                        </Stack>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={onViewItems} sx={{ flex: 1, borderRadius: 2 }}>
                        View Items
                    </Button>
                    <Button 
                        variant="contained" 
                        color={isConfirmed ? "success" : "primary"}
                        size="small" 
                        onClick={onConfirm}
                        disabled={isConfirmed}
                        sx={{ flex: 1, borderRadius: 2 }}
                    >
                        {isConfirmed ? 'Confirmed' : 'Confirm'}
                    </Button>
                </Stack>
            </Box>

            {items.length > 0 && (
                <>
                    <Divider />
                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Manifest</Typography>
                        <Stack spacing={0.5}>
                            {items.slice(0, 3).map((item) => (
                                <Box key={item.item?._id} sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">{item.item?.name}</Typography>
                                    <Typography variant="body2" fontWeight="bold">x{item.quantity}</Typography>
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