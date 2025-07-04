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
            <ManageLayout open={drawerOpen} onClose={() => setDrawerOpen(false)} toggleSidebar={handleDrawerToggle} >
                <Outlet />
            </ManageLayout>
        </div>
        
    );
};

export default AdminConsole;
