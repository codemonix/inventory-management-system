import { Box, Typography } from "@mui/material";
import { logInfo } from "../utils/logger.js";
import ItemCardTransfer from "./ItemCardTransfer.jsx";

export default function TransferItemsList({ items }) {
    logInfo("TransferItemsList -> items:", items);

    // Empty State
    if (!items || items.length === 0) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 4, 
                    mt: 1,
                    bgcolor: 'background.default', 
                    border: '2px dashed', 
                    borderColor: 'divider', 
                    borderRadius: 2 
                }}
            >
                <Typography variant="body1" fontWeight="medium" color="text.secondary">
                    No items in this transfer.
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                    This package is currently empty.
                </Typography>
            </Box>
        );
    }

    return (
        <Box 
            sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                    xs: 'repeat(2, 1fr)', 
                    sm: 'repeat(3, 1fr)', 
                    md: 'repeat(4, 1fr)' 
                }, 
                gap: { xs: 1.5, sm: 2 }, 
                py: 1 
            }}
        >
            {items.map((itm) => (
                <ItemCardTransfer 
                    key={itm.item?._id || Math.random()} 
                    item={itm} 
                />
            ))}
        </Box>
    );
}