import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const StockDetails = ({ item, locationColors }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', flexGrow: 1, width: '100px'}}>
      {item.stock.map((stock) => (
        <Box key={stock.locationId} display="flex" alignItems="center" spacing={1} mt={1}>
          <Avatar
            sx={{
              width: 16,
              height: 16,
              backgroundColor: locationColors[stock.locationName] || 'gray',
            }}
          />
          <Typography variant="body2" sx={{ marginLeft: 1 }}>
            {stock.locationName}: {stock.quantity}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default StockDetails;
