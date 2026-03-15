import { Outlet, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ManageSideDrawer from './ManageSideDrawer';
import { useState } from 'react';
import { logDebug } from '../../utils/logger';



export default function AdminLayout() {
    const [ open, setOpen ] = useState(false);
    const location = useLocation();

    const pageTitles = {
        '/manage/logs': 'System Audit Logs',
        '/manage/system': 'System Administration',
        '/manage/users': 'User Administration',
        '/manage/dashboard': 'Overview'
    };

    const toggleSidebar = () => {
        setOpen((prev) => !prev);
        logDebug("AdminLayout -> toggleSidebar -> open", open);
}

    return (
        <div style={{ display: 'flex' }} >
            <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} >
                <Toolbar>
                    <IconButton onClick={toggleSidebar} sx={{ position: 'fixed', top: 0, left: 10, zIndex: 1000 }}>
                        <MenuIcon fontSize="large" />
                    </IconButton>
                    <Typography variant='h7' noWrap component='div' sx={{ flexGrow: 1, alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                        Manage Dashboard | {pageTitles[location.pathname]}
                    </Typography>
                </Toolbar>
            </AppBar>
            <ManageSideDrawer open={open} onClose={() => setOpen(false)} toggleSidebar={toggleSidebar} />
            <main style={{ width: '100%', padding: '70px 10px 10px'}}>
                <Outlet />
            </main>
        </div>
    );
}

