import { Card, Box, Typography, Chip, IconButton, Tooltip, Divider, Stack } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Helper to map status strings to our Theme colors
const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending': return 'warning';
        case 'in_transit': return 'info';
        case 'completed': return 'success';
        case 'cancelled':
        case 'rejected': return 'error';
        default: return 'default';
    }
};

const TransferCard = ({ transfer, onView, onApprove, onReject, showActions = true }) => {
    // Safety check
    if (!transfer) return null;

    const statusColor = getStatusColor(transfer.status);

    return (
        <Card 
            elevation={0} 
            sx={{ 
                mb: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                bgcolor: 'background.paper',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 1 }
            }}
        >
            {/* Header: ID, Date, and Status */}
            <Box sx={{ 
                p: 1.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: 'action.hover', // Slight contrast for the header
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        ID: {transfer._id?.substring(0, 8).toUpperCase() || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {new Date(transfer.createdAt).toLocaleDateString()}
                    </Typography>
                </Box>
                
                {/* The Themed Status Badge */}
                <Chip 
                    label={transfer.status || 'Unknown'} 
                    color={statusColor} 
                    size="small" 
                    sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                />
            </Box>

            {/* Body: Routing Details */}
            <Box sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">From</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {transfer.fromLocation?.name || 'Unknown'}
                        </Typography>
                    </Box>
                    
                    <ArrowForwardIcon color="action" />

                    <Box sx={{ flex: 1, textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">To</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {transfer.toLocation?.name || 'Unknown'}
                        </Typography>
                    </Box>
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    Items: <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{transfer.items?.length || 0}</Box>
                </Typography>
            </Box>

            {/* Footer: Action Buttons */}
            {showActions && (
                <>
                    <Divider />
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {transfer.status?.toLowerCase() === 'pending' && (
                            <>
                                <Tooltip title="Approve">
                                    <IconButton size="small" color="success" onClick={() => onApprove(transfer)}>
                                        <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                    <IconButton size="small" color="error" onClick={() => onReject(transfer)}>
                                        <CancelIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={() => onView(transfer)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </>
            )}
        </Card>
    );
};

export default TransferCard;