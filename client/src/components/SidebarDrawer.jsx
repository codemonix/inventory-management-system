import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Drawer, Divider, List, ListItem, 
    ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from "../context/AuthContext.jsx";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { logDebug } from "../utils/logger.js";




function SidebarDrawer() {
    const { isAdmin, isLoggedIn, isManager } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const isManagerOrAdmin = isAdmin || isManager;
    logDebug("SidebarDrawer -> isAdminOrManager", isManagerOrAdmin);

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

    const getNavItemStyles = (isActive) => ({
    backgroundColor: isActive ? '#1e40af' : 'transparent', 
    color: isActive ? '#ffffff' : 'rgb(58, 91, 161)', 
    m: 1,
    px: 2,
    '&:hover': {
        backgroundColor: '#1d4ed8', 
        color: '#fff',
        },
    });

    const drawerContent = (
        <div className="w-[250px] h-full flex flex-col" onClick={toggleSidebar}>
            <div>
            <List>
                {navItems.map(({ label, to }) => (
                    <ListItem key={to} disablePadding>
                        <NavLink to={to}
                            className="no-underline w-full text-inherit">
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
                                <NavLink to="/manage" className="no-underline w-full">
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
                                                <ListItemIcon className="text-white" >
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
        </div>

        { isLoggedIn && (
            <div className="mt-auto" >
                <Divider />
                <List >
                    <ListItem disablePadding>
                        <NavLink to="/logout" className="no-underline w-full block" >
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
            </div>
        )}
        </div>
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