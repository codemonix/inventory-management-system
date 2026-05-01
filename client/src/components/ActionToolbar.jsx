import { Box, Button, Collapse, useMediaQuery, useTheme, Stack } from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const ActionToolbar = ({
    isAddOpen,
    isSearchOpen,
    onToggleAdd,
    onToggleSearch,
    searchComponent,
    addComponent
}) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    // ==========================================
    // DESKTOP VIEW
    // ==========================================
    if (isDesktop) {
        return (
            <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="stretch" justifyContent="space-between">
                    
                    <Box sx={{ flexGrow: 1 }}>
                        {searchComponent}
                    </Box>

                    <Button
                        variant={isAddOpen ? "outlined" : "contained"}
                        color={isAddOpen ? "error" : "primary"}
                        startIcon={isAddOpen ? <CloseIcon /> : <AddIcon />}
                        onClick={onToggleAdd}
                        sx={{ 
                            minWidth: '140px',
                            fontWeight: 'bold',
                            borderRadius: 2
                        }}
                    >
                        {isAddOpen ? "Cancel" : "Add Item"}
                    </Button>
                </Stack>

                <Collapse in={isAddOpen}>
                    <Box sx={{ mt: 2 }}>
                        {addComponent}
                    </Box>
                </Collapse>
            </Box>
        );
    }

    // ==========================================
    // MOBILE VIEW
    // ==========================================
    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                    fullWidth
                    variant={isSearchOpen ? "outlined" : "contained"}
                    color={isSearchOpen ? "secondary" : "inherit"}
                    startIcon={isSearchOpen ? <CloseIcon /> : <SearchIcon />}
                    onClick={onToggleSearch}
                    sx={{ 
                        flex: 1, 
                        height: '48px', 
                        fontWeight: 'bold',
                        // Dynamic styling for dark/light mode compatibility
                        bgcolor: isSearchOpen ? 'action.selected' : 'background.paper',
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                >
                    {isSearchOpen ? "Close" : "Search"}
                </Button>

                <Button
                    fullWidth
                    variant={isAddOpen ? "outlined" : "contained"}
                    color={isAddOpen ? "error" : "primary"}
                    startIcon={isAddOpen ? <CloseIcon /> : <AddIcon />}
                    onClick={onToggleAdd}
                    sx={{ flex: 1, height: '48px', fontWeight: 'bold' }}
                >
                    {isAddOpen ? "Cancel" : "Add Item"}
                </Button>
            </Stack>

            <Collapse in={isSearchOpen && !isAddOpen}>
                <Box sx={{ mb: 2 }}>
                    {searchComponent}
                </Box>
            </Collapse>

            <Collapse in={isAddOpen}>
                <Box sx={{ mb: 2 }}>
                    {addComponent}
                </Box>
            </Collapse>
        </Box>
    );
};

export default ActionToolbar;