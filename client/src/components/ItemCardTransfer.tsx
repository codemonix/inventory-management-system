import { Box, Typography, Card, CardContent, Divider, Chip } from "@mui/material";
import { logDebug } from "../utils/logger";
import { fetchItemImage } from "../services/itemService.js";
import { useManagedImage } from "../hooks/useManagedObjectImage.js";

export default function ItemCardTransfer({ item: transferItem }) {
    const { item, quantity } = transferItem;

    logDebug("ItemCardTransfer.jsx -> imageUrl:", item?.imageUrl);
    const { displayUrl, isImageLoading } = useManagedImage(item?.imageUrl, fetchItemImage);

    return (
        <Card 
            elevation={0}
            className="group"
            sx={{ 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)'
                }
            }}
        >
            {/* 1. Image Area - Full Visibility */}
            <Box 
                sx={{ 
                    position: 'relative',
                    width: '100%',
                    pt: '100%', // Fixed 1:1 Aspect Ratio
                    bgcolor: 'action.hover',
                    overflow: 'hidden'
                }}
            >
                {item?.imageUrl && displayUrl ? (
                    <Box 
                        component="img"
                        src={displayUrl}
                        alt={item?.name}
                        sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                            '.group:hover &': { transform: 'scale(1.08)' }
                        }}
                    />
                ) : (
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.disabled'
                        }}
                    >
                        <Typography variant="h3">📦</Typography>
                    </Box>
                )}

                {/* Quantity Badge - High Contrast Overlay */}
                <Chip 
                    label={`QTY: ${quantity}`} 
                    size="small"
                    color="primary"
                    sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        boxShadow: 2,
                        pointerEvents: 'none'
                    }} 
                />
            </Box>

            <Divider />

            {/* 2. Text Area - Maximum Readability */}
            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        lineHeight: 1.3,
                        textAlign: 'center',
                        width: '100%',
                        // Allows the name to wrap up to 2 lines before truncating
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                    title={item?.name}
                >
                    {item?.name || 'Unknown Item'}
                </Typography>
            </CardContent>
        </Card>
    );
}