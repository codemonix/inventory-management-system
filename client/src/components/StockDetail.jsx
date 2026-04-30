
import { Box, Typography, Avatar } from '@mui/material';

const StockDetails = ({ item, locationColors, direction = 'column ', width }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: direction, justifyContent: 'flex-start', alignItems: 'flex-start', flexGrow: 1, width: width}}>
      {item.stock.map((stock) => (
        <Box key={stock.locationId} display="flex" flexDirection="row" alignItems="center" justifyContent="center" mt={1} mr={1}>
          <Avatar
            sx={{
              width: 16,
              height: 16,
              backgroundColor: locationColors[stock.locationName] || 'gray',
            }}
          />
          <Typography variant="body2" ml={0.5}>
            {stock.locationName}: {stock.quantity}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default StockDetails;
