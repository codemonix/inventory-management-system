import { Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Semantic map pin icon
import { logDebug } from '../utils/logger';

const StockDetails = ({ item, locationColors, direction = 'column ', width, locations }) => {
  // Defensive check in case stock data is missing
  if (!item?.stock || item.stock.length === 0) return null;
  logDebug("StockDetails -> item:", item);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: direction, 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        flexGrow: 1, 
        width: width,
        flexWrap: 'wrap' // Ensures horizontal lists wrap nicely on mobile
      }}
    >
      {item.stock.map((stock) => (
        <Box 
          key={stock.locationId} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            mt: 0.5, 
            mr: 1.5 
          }}
        >
          {/* Replaced empty Avatar with a colored Location Pin */}
          <LocationOnIcon 
            sx={{ 
              fontSize: 18, 
              // Uses the specific city color, or defaults to a theme-aware gray
              color:  locations?.find((loc) => loc._id === stock.locationId)?.color || 'text.secondary' 
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 0.5, 
              color: 'text.secondary' 
            }}
          >
            {stock.locationName}: <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{stock.quantity}</Box>
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default StockDetails;