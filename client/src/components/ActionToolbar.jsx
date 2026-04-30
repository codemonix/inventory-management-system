import { Box, Button, Collapse, IconButton, useMediaQuery, useTheme, Stack } from '@mui/material';

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
            <Box sx={{ mb: 1 }}>
                {/* Top Row: Always-visible Search + Add Button */}
                <Stack direction="row" spacing={2} alignItems="stretch" justifyContent="space-between">
                    
                    {/* Search & Filter Component stretches to fill available space */}
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {searchComponent}
                    </Box>

                    {/* Primary Action Button */}
                    <Button
                        variant={isAddOpen ? "outlined" : "contained"}
                        color={isAddOpen ? "error" : "primary"}
                        startIcon={isAddOpen ? <CloseIcon /> : null}
                        onClick={onToggleAdd}
                        sx={{ 
                            // height: '56px', // Matches standard MUI text field height
                            // whiteSpace: 'nowrap',
                            // px: 2,
                            py: 3,
                            alignSelf: 'flex-start',
                            height: '100%',
                            lineHeight: 1.1,
                            fontWeight: 'bold',
                            minWidth: '100px'
                        }}
                    >
                        {isAddOpen ? ("Cancel") : (<span>Add<br />Item</span>)}
                    </Button>
                </Stack>

                {/* The Create Form drops down smoothly below the bar when clicked */}
                <Collapse in={isAddOpen}>
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, border: '1px solid #e0e0e0' }}>
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
            {/* Split Full-Width Buttons for Touch */}
            <Stack direction="row" spacing={2} sx={{ mb: 0, px: 1 }}>
                <Button
                    fullWidth
                    variant={isSearchOpen ? "outlined" : "contained"}
                    // color="error"
                    startIcon={isSearchOpen ? <CloseIcon /> : <SearchIcon />}
                    onClick={onToggleSearch}
                    sx={{ 
                        flex: 1, 
                        height: '48px', // Standard mobile touch target height
                        fontWeight: 'bold',
                        color: '#374151', // Dark text for readability
                        borderColor: '#e5e7eb', // Subtle border
                        bgcolor: isSearchOpen ? '#f9fafb' : 'transparent',
                        '&:hover': {
                        bgcolor: '#f3f4f6', // Slightly darker off-white on hover
                        borderColor: '#d1d5db',
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
                    sx={{ 
                        flex: 1, 
                        height: '48px', 
                        fontWeight: 'bold' 
                    }}
                >
                    {isAddOpen ? "Cancel" : "Add Item"}
                </Button>
            </Stack>

            {/* Collapsible Search */}
            <Collapse in={isSearchOpen && !isAddOpen}>
                <Box sx={{ mb: 2 }}>
                    {searchComponent}
                </Box>
            </Collapse>

            {/* Collapsible Create Form */}
            <Collapse in={isAddOpen}>
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0' }}>
                    {addComponent}
                </Box>
            </Collapse>
        </Box>
    );
};

export default ActionToolbar;