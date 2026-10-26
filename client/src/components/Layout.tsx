import { useContext, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SidebarDrawer from './SidebarDrawer';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../context/ColorModeContext';
import AuthLoading from './AuthLoading';
import ErrorBoundary from './ErrorBoundary';

const ROUTE_NAMES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/items': 'Items',
  '/locations': 'Locations',
  '/transfers': 'Transfer Manager',
};

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);

  const pageName = ROUTE_NAMES[location.pathname] ?? 'App';
  const userName = user?.name ?? (user as unknown as { user?: { name?: string } })?.user?.name ?? 'User';

  useEffect(() => {
    document.title = `${userName} | ${pageName}`;
  }, [location.pathname, userName, pageName]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          position: 'relative',
          bgcolor: 'background.header',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>
            {userName} |
          </Box>
          {` ${pageName}`}
        </Typography>

        <IconButton
          onClick={toggleColorMode}
          aria-label={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          sx={{ position: 'absolute', right: 16 }}
        >
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <SidebarDrawer />

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, md: 3 } }}>
        {/* Keeps the layout visible while a lazily loaded page downloads */}
        <ErrorBoundary resetKey={location.pathname}>
            <Suspense fallback={<AuthLoading />}>
                <Outlet />
            </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

export default Layout;

