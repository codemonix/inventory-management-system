import { Box, Typography, Button, Paper } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { logDebug } from "../utils/logger.js";
import TempTransferCard from "./TempTransferCard.jsx";

const ActiveTransferSection = ({ tempTransfer, tempTransferStatus, populatedTempTransfer, onStartNew, onFinalize }) => {
    logDebug("ActiveTransferSection -> populatedTempTransfer:", populatedTempTransfer);
    
    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">In-Progress Transfer</Typography>
                {!tempTransfer && tempTransferStatus !== 'loading' && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onStartNew} sx={{ borderRadius: 2 }}>
                        Start New
                    </Button>
                )}
            </Box>

            {tempTransferStatus === 'loading' ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary">Loading draft...</Typography>
                </Box>
            ) : !tempTransfer ? (
                <Box sx={{ py: 6, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">No active transfer session found.</Typography>
                </Box>
            ) : (
                <TempTransferCard 
                    populatedTempTransfer={populatedTempTransfer} 
                    onFinalize={onFinalize}
                />
            )}
        </Paper>
    );
};

export default ActiveTransferSection;