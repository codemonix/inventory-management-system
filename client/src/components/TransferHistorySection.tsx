import { Paper, Typography, Box, useTheme, useMediaQuery, Stack } from "@mui/material";
import FinalizedTransferCard from "./FinalizedTransferCard.jsx";
import TransfersDataGrid from "./TransfersDataGrid.jsx";

const TransferHistorySection = ({ transfers, onViewItems, onConfirmDialog }) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                Finalized History
            </Typography>
            
            {transfers.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">No past transfers found.</Typography>
                </Box>
            ) : isDesktop ? (
                <TransfersDataGrid 
                    transfers={transfers} 
                    onViewItems={onViewItems}
                    onConfirm={onConfirmDialog}
                />
            ) : (
                <Stack spacing={2}>
                    {transfers.map((transfer) => (
                        <FinalizedTransferCard 
                            key={transfer._id} 
                            transfer={transfer} 
                            onViewItems={() => onViewItems(transfer)}
                            onConfirm={() => onConfirmDialog(transfer)}
                        />
                    ))}
                </Stack>
            )}
        </Paper>
    );
};

export default TransferHistorySection;