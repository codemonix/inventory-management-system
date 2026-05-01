import { Outlet, useLocation } from "react-router-dom";
import SidebarDrawer from "./SidebarDrawer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useContext } from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from "../context/ThemeContextProvider.jsx";

const ROUTE_NAMES = {
    '/dashboard': 'Dashboard',
    '/items': 'Items',
    '/locations': 'Locations',
    '/users': 'Users',
    '/logs': 'Logs',
    '/transfers': 'Transfer Manager',
}

const Layout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);

    const pageName = ROUTE_NAMES[location.pathname] || 'App';
    const userName = user?.name || user?.user?.name || 'User'; 

    useEffect(() => {
        document.title = `${userName} | ${pageName}`;
    }, [location.pathname, userName, pageName]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            {/* THE UPGRADED HEADER */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 2,
                position: 'relative',
                bgcolor: 'background.header',  // Makes the header a distinct surface
                borderBottom: '1px solid',    // Creates a physical boundary
                borderColor: 'divider',       // Dark-mode compliant border
                zIndex: 10                    // Ensures it visually sits above the content
            }}>
                
                <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 'bold', color: 'text.primary' }}
                >
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>
                        {userName} | 
                    </Box> 
                    {` ${pageName}`}
                </Typography>

                
                {/* Theme Toggle Button */}
                <IconButton 
                    onClick={toggleColorMode} 
                    sx={{ position: 'absolute', right: 16 }} 
                >
                    {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
            </Box>
            
            <SidebarDrawer />
            
            {/* MAIN WORKSPACE */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, md: 3 } }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;