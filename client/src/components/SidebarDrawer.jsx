import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { 
    Box, Drawer, Divider, List, ListItem, 
    ListItemButton, ListItemIcon, ListItemText, IconButton,
    useTheme
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from "../context/AuthContext.jsx";
import { ColorModeContext } from "../context/ThemeContextProvider.jsx";

function SidebarDrawer() {
    const { isAdmin, isLoggedIn, isManager } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const isManagerOrAdmin = isAdmin || isManager;
    
    // Hooks for Theme and Context
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    const navItems = [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Items", to: "/items" },
        { label: "Locations", to: "/locations" },
        { label: "Transfers", to: "/transfers" },
    ];

    // Dynamic style function that reads directly from your theme.js
    const getNavItemStyles = (isActive) => ({
        bgcolor: isActive ? 'primary.main' : 'transparent', 
        color: isActive ? 'primary.contrastText' : 'text.primary', 
        borderRadius: 1,
        m: 1,
        px: 2,
        '&:hover': {
            bgcolor: isActive ? 'primary.dark' : 'action.hover', 
        },
    });

    const drawerContent = (
        <Box 
            sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }} 
            onClick={toggleSidebar}
        >
            <Box>
                <List>
                    {navItems.map(({ label, to }) => (
                        <ListItem key={to} disablePadding>
                            <NavLink to={to} style={{ textDecoration: 'none', width: '100%' }}>
                                {({ isActive }) => (
                                    <ListItemButton sx={getNavItemStyles(isActive)}>
                                        <ListItemText primary={label} />
                                    </ListItemButton>
                                )}
                            </NavLink>
                        </ListItem>
                    ))}
                </List>
                
                {isLoggedIn && isManagerOrAdmin && (
                    <>  
                        <Divider />
                        <List>
                            <ListItem disablePadding>
                                <NavLink to="/manage" style={{ textDecoration: 'none', width: '100%' }}>
                                    {({ isActive }) => (
                                        <ListItemButton sx={{ ...getNavItemStyles(isActive), color: isActive ? 'primary.contrastText' : 'secondary.main' }}>
                                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                                <AdminPanelSettingsIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary="Manage" />
                                        </ListItemButton>
                                    )}
                                </NavLink>
                            </ListItem>                            
                        </List>
                    </>
                )}
            </Box>

            {isLoggedIn && (
                <Box sx={{ mt: 'auto' }}>
                    <Divider />
                    <List>
                        {/* Logout Button */}
                        <ListItem disablePadding>
                            <NavLink to="/logout" style={{ textDecoration: 'none', width: '100%' }}>
                                <ListItemButton 
                                    sx={{ 
                                        bgcolor: 'error.main', 
                                        color: 'error.contrastText',
                                        borderRadius: 1,
                                        m: 1,
                                        px: 2,
                                        '&:hover': { bgcolor: 'error.dark' },
                                    }}>
                                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </ListItemButton>
                            </NavLink>
                        </ListItem>
                    </List>
                </Box>
            )}
        </Box>
    );

    return (
        <Box>
            <IconButton 
                onClick={toggleSidebar} 
                sx={{ 
                    position: 'fixed', 
                    top: 12, 
                    left: 12, 
                    zIndex: 1000, 
                    bgcolor: 'background.paper', 
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                }}
            >
                <MenuIcon />
            </IconButton>
            <Drawer open={isOpen} onClose={toggleSidebar}>
                {drawerContent}
            </Drawer>
        </Box>
    );
}

export default SidebarDrawer;