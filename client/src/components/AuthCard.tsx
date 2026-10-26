import { ReactNode, useContext } from 'react';
import { Box, IconButton, Paper, Tooltip, useTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from '../context/ColorModeContext';

interface AuthCardProps {
    children: ReactNode;
    maxWidth?: number;
}

// Card for the pages shown outside the app layout (login, register, setup).
// Uses theme colors so it reads well in light and dark mode, and offers the mode toggle there too.
const AuthCard = ({ children, maxWidth = 400 }: AuthCardProps) => {
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', px: 2, py: { xs: 4, sm: 10 } }}>
            <Paper
                elevation={isDark ? 0 : 1}
                sx={{
                    position: 'relative',
                    maxWidth,
                    mx: 'auto',
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
                    <IconButton
                        onClick={toggleColorMode}
                        size="small"
                        aria-label="Toggle dark mode"
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                    >
                        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
                {children}
            </Paper>
        </Box>
    );
};

export default AuthCard;
