import { Box, Button, Collapse, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const ActionToolbar = ({
    isAddOpen,
    isSearchOpen,
    onToggleAdd,
    onToggleSearch,
    searchComponent,
    addComponent
}) => {
    return (
        <Box sx={{ width: '100%', mb: 1 }}>
            
            {/* 1. Persistent, Responsive Header Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                
                {/* Search Toggle Button */}
                <Button
                    variant={isSearchOpen ? "contained" : "outlined"}
                    color={isSearchOpen ? "inherit" : "primary"}
                    onClick={onToggleSearch}
                    disableElevation
                    sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 600,
                        // Small square on mobile, standard button on tablet/desktop
                        minWidth: { xs: '48px', sm: '140px' }, 
                        px: { xs: 0, sm: 2 },
                        bgcolor: 'grey.300',         
                        color: 'text.primary',       
                        '&:hover': {
                            bgcolor: 'grey.400',     
                        }
                    }}
                >
                    {isSearchOpen ? <CloseIcon /> : <SearchIcon />}
                    {/* Hide text on extra-small screens (mobile) */}
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                        {isSearchOpen ? "Close" : "Search & Filter"}
                    </Box>
                </Button>

                {/* Add Toggle Button */}
                <Button
                    variant={isAddOpen ? "contained" : "contained"}
                    color={isAddOpen ? "error" : "primary"}
                    onClick={onToggleAdd}
                    disableElevation
                    sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 600,
                        minWidth: { xs: '48px', sm: '140px' },
                        px: { xs: 0, sm: 2 } 
                    }}
                >
                    {isAddOpen ? <CloseIcon /> : <AddIcon />}
                    {/* Hide text on extra-small screens (mobile) */}
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                        {isAddOpen ? "Cancel" : "Add Item"}
                    </Box>
                </Button>
            </Box>

            {/* A subtle divider that fades in when a panel is open */}
            <Divider sx={{ 
                mt: 1, 
                mb: 1, 
                opacity: (isAddOpen || isSearchOpen) ? 1 : 0, 
                transition: 'opacity 0.3s' 
            }} />

            {/* 2. Search Panel Slide-in */}
            <Collapse in={isSearchOpen} unmountOnExit>
                <Box sx={{ pb: 1 }}>
                    {searchComponent}
                </Box>
            </Collapse>

            {/* 3. Add Panel Slide-in */}
            <Collapse in={isAddOpen} unmountOnExit>
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
                    {addComponent}
                </Box>
            </Collapse> 

        </Box>
    );
};

export default ActionToolbar;
