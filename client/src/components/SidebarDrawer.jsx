import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Button, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import LensTwoToneIcon from '@mui/icons-material/LensTwoTone';
import MenuIcon from '@mui/icons-material/Menu';
// import { link } from "react-router-dom";
// import { useAuth } from "../context/AuthProvider.jsx";
import { getToken } from "../utils/auth.js";


function SidebarDrawer() {
    const isAuth = !!getToken();
    const [isOpen, setIsOpen] = useState(false);

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

    const drawerContent = (
        <Box sx={{ width: 250 }} onClick={toggleSidebar}>
            <List>
                {navItems.map(({ label, to }) => (
                    <ListItem key={to} disablePadding>
                        <NavLink to={to} 
                            style={ { textDecoration: 'none', color: 'inherit' } }
                            className={ ({ isActive }) => (isActive ? "text-blue-500 font-bold" : "text-white hover:text-blue-500")}
                            >
                                <ListItemButton>
                                    <ListItemText primary={label} />
                                </ListItemButton>
                            </NavLink>
                    </ListItem>
                ))}
            </List>
                {isAuth && (
                    <>
                    <Divider />
                        <List>
                            <ListItem disablePadding>
                                <NavLink to="/logout" 
                                    style={ { textDecoration: 'none', color: 'inherit', width: '100%' } }
                                    className="mt-auto block px-3 py-2 m-4 rounded bg-red-400 hover:bg-red-500 text-center"
                                    >
                                        <ListItemButton sx={{ backgroundColor: '#f87171', color: '#fff', '&:hover': { backgroundColor: '##ef4444' } }}>
                                            <ListItemText primary="Logout"  sx={{ textAlign: 'center'}} />
                                        </ListItemButton>
                                    </NavLink>
                            </ListItem>
                        </List>
                    </>
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