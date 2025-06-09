import { Outlet, NavLink } from 'react-router-dom';
import { Drawer, AppBar, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ListAltIcon from '@mui/icons-material/ListAlt';

const drawerWidth = 240;

const linkStyles = ({ isActive}) => ({
    color: isActive ? '#1976d2' : 'inherit',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
});

export default function AdminLayout() {
    return (
        <div style={{ display: 'flex' }} >
            <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} >
                <Toolbar>
                    <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
                        Admin Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer 
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
            </Drawer>
            
            <main style={{ flexGrow: 1, padding: '80px 24px 24px'}}>
                <Outlet />
            </main>
        </div>
    );
}

