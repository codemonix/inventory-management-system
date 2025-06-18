import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Button, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import LensTwoToneIcon from '@mui/icons-material/LensTwoTone';
import MenuIcon from '@mui/icons-material/Menu';
// import { link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// import { getToken } from "../utils/auth.js";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


function SidebarDrawer() {
    const { isAdmin, isLoggedIn, isManager } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const isManagerOrAdmin = isAdmin || isManager;
    console.log("SidebarDrawer -> isAdmin", isAdmin);

    const toggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };

    const navItems = [
        { label: "Home", to: "/" },
        { label: "Dashboard", to: "/dashboard" },
        { label: "Items", to: "/items" },
        { label: "Locations", to: "/locations" },
        { label: "Transfers", to: "/transfers" },
    ];
    // color:rgb(91, 117, 171)
  const getNavItemStyles = (isActive) => ({
  backgroundColor: isActive ? '#1e40af' : 'transparent', // active: blue-900
  color: isActive ? '#ffffff' : 'rgb(58, 91, 161)', // active: white, inactive: gray-200
  borderRadius: 1,
  m: 1,
  px: 2,
  '&:hover': {
    backgroundColor: '#1d4ed8', // hover: blue-700
    color: '#fff',
  },
});

    const drawerContent = (
        <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }} onClick={toggleSidebar}>
            <Box>
            <List>
                {navItems.map(({ label, to }) => (
                    <ListItem key={to} disablePadding>
                        <NavLink to={to} 
                            style={ { textDecoration: 'none', width: '100%', color: 'inherit' } }>
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
                                <NavLink to="/manage" style={ { textDecoration: 'none', width: '100%'}}>
                                    {({ isActive}) => (
                                        <ListItemButton
                                            sx={{
                                                ...getNavItemStyles(isActive),
                                                color: '#fff',
                                                backgroundColor: isActive ? '#2563eb' : '#3b82f6',
                                                ':hover': {
                                                    backgroundColor: 'rgba(0, 98, 189, 0.96)', 
                                                    
                                                },
                                            }}
                                            >
                                                <ListItemIcon sx={{ color: '#fff'}} >
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

        { isLoggedIn && (
            <Box sx={{ mt: 'auto'}} >
                <Divider />
                <List >
                    <ListItem disablePadding>
                        <NavLink to="/logout" style={{ textDecoration: 'none', width: '100%' }} >
                            <ListItemButton 
                                sx={{ 
                                    backgroundColor: '#f87171',
                                    color: '#fff',
                                    borderRadius: 1,
                                    m: 1,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: '#ef4444',
                                    },
                                }}>
                                <ListItemText primary="Logout" sx={{ textAlign: 'center'}}/>
                            </ListItemButton>
                        </NavLink>
                    </ListItem>
                </List>
            </Box>
        )}
        </Box>
    );

    return (
        <div>
            <IconButton onClick={toggleSidebar} sx={{ position: 'fixed', top: 0, left: 10, zIndex: 1000 }}>
                <MenuIcon fontSize="large" />
            </IconButton>
            <Drawer open={isOpen} onClose={toggleSidebar} >
                {drawerContent}
            </Drawer>
        </div>
    );
};

export default SidebarDrawer;