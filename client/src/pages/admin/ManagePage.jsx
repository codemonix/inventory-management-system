import { useState } from 'react';
import ManageSideDrawer from '../../components/admin/ManageSideDrawer';
import { Outlet } from 'react-router-dom';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const AdminConsole = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <div style={{ display: 'flex', height: '100vh'}} >
            {/* <ManageSideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }} >
                <IconButton 
                    sx={{ display: { md: 'none' }, mb: 2 }}
                    onClick={handleDrawerToggle}
                >
                    <MenuIcon />
                </IconButton> */}
            <ManageLayout open={drawerOpen} onClose={() => setDrawerOpen(false)} toggleSidebar={handleDrawerToggle} >
                <Outlet />
            </ManageLayout>
        </div>
        
    );
};

export default AdminConsole;
