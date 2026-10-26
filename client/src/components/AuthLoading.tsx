import { Box, CircularProgress } from '@mui/material';

// Shown while the stored token is being verified with /auth/me
const AuthLoading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
    <CircularProgress />
  </Box>
);

export default AuthLoading;
