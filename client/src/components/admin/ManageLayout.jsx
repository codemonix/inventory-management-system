import { Outlet, NavLink } from 'react-router-dom';
import { Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ManageSideDrawer from './ManageSideDrawer';
import { useState } from 'react';

// const drawerWidth = 240;

// const linkStyles = ({ isActive}) => ({
//     color: isActive ? '#1976d2' : 'inherit',
//     fontWeight: isActive ? 'bold' : 'normal',
//     textDecoration: 'none',
// });



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
            <main style={{ flexGrow: 1, padding: '80px 24px 24px'}}>
                <Outlet />
            </main>
            {/* <Drawer 
                variant='permanent'
                sx={{ 
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                >
                <Toolbar />
                <List >
                    <ListItemButton component={NavLink} to='users' style={linkStyles} >
                        <ListItemIcon>
                            <SupervisorAccountIcon />
                        </ListItemIcon>
                        <ListItemText primary='User Management' />
                    </ListItemButton>

                    <ListItemButton component={NavLink} to='logs' style={linkStyles} >
                        <ListItemIcon>
                            <ListAltIcon />
                        </ListItemIcon>
                        <ListItemText primary='Log Monitoring' />
                    </ListItemButton>
                </List>
            </Drawer> */}
            
            
        </div>
    );
}

