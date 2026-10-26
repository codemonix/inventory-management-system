import { logDebug, logInfo } from "../utils/logger";
import { Box, Card, Typography, Stack, Chip, Paper, Divider, Button } from "@mui/material";

const TempTransferCard = ({ populatedTempTransfer, onFinalize }) => {
    logDebug("TempTransferCard.jsx -> populatedTempTransfer:", populatedTempTransfer);
    logInfo("loading TempTransferCard ...");

    // Safety check just in case it's entirely undefined
    const { fromLocation, toLocation, items = [] } = populatedTempTransfer || {};

    // Early return for empty states
    if (!populatedTempTransfer || !populatedTempTransfer.items || populatedTempTransfer.items.length === 0) {
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
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ pt: 1 }}>
                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                        {fromLocation?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="error.main">→</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {toLocation?.name || 'N/A'}
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mt: 1 }}>
                    No items in temporary transfer.
                </Typography>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Chip 
                        label="DRAFT TRANSFER" 
                        color="warning" 
                        size="small" 
                        sx={{ fontWeight: 'bold', fontSize: '0.65rem', letterSpacing: 1, mb: 1 }} 
                    />
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold" color="text.primary">
                            {fromLocation?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="error.main">→</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {toLocation?.name || 'N/A'}
                        </Typography>
                    </Stack>
                </Box>
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
                        <Box key={item.itemId || item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                            <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                {item.name || "Unknown Item"}
                            </Typography>
                            <Box sx={{ bgcolor: 'action.hover', px: 1, py: 0.25, borderRadius: 1 }}>
                                <Typography variant="body2" fontFamily="monospace" color="text.primary">
                                    x{item.quantity}
                                </Typography>
                            </Box>
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
        </Card>
    );
};

export default TempTransferCard;