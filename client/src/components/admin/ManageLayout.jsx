import { Outlet, NavLink } from 'react-router-dom';
import { Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ManageSideDrawer from './ManageSideDrawer';
import { useState } from 'react';


export default function AdminLayout() {
    const [ open, setOpen ] = useState(false);

    const toggleSidebar = () => {
        setOpen((prev) => !prev);
        console.log("AdminLayout -> toggleSidebar -> open", open);
}

    return (
        <div style={{ display: 'flex' }} >
            <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} >
                <Toolbar>
                    <IconButton onClick={toggleSidebar} sx={{ position: 'fixed', top: 0, left: 10, zIndex: 1000 }}>
                        <MenuIcon fontSize="large" />
                    </IconButton>
                    <Typography variant='h7' noWrap component='div' sx={{ flexGrow: 1, alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                        Manage Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <ManageSideDrawer open={open} onClose={() => setOpen(false)} toggleSidebar={toggleSidebar} />
            <main style={{ width: '100%', padding: '80px 24px 24px'}}>
                <Outlet />
            </main>
        </div>
    );
}

