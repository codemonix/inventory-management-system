import { useState, useEffect, useRef } from "react";
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    InputAdornment,
    IconButton,
    Stack
} from "@mui/material";

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const SearchFilterBar = ({ search, limit, sort, onSearchChange, onLimitChange, onSortChange }) => {
    const [inputValue, setInputValue] = useState(search || '');
    const debounceTimeoutRef = useRef(null);

    useEffect(() => {
        setInputValue(search);
    }, [search]);

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

        if (value.trim() === '') {
            onSearchChange('');
            return;
        }
        debounceTimeoutRef.current = setTimeout(() => {
            onSearchChange(value);
        }, 500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            onSearchChange(inputValue);
        }
    };

    const handleClear = () => {
        setInputValue('');
        onSearchChange('');
    };

    return (
        // Replaced Tailwind with MUI Paper & Stack for guaranteed alignment
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                bgcolor: 'background.paper' 
            }}
        >
            <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={2} 
                alignItems="center"
            >
                {/* Search Input */}
                <TextField 
                    label="Search"
                    variant="outlined"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by name"
                    fullWidth
                    sx={{ flexGrow: 1 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: inputValue ? (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClear} edge="end" size="small">
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }
                    }}
                />

                {/* Limit Dropdown */}
                <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel>Limit</InputLabel>
                    <Select 
                        value={limit}
                        label="Limit"
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                    >
                        {[5, 10, 20, 50].map((l) => (
                            <MenuItem key={l} value={l}>{l} per page</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                {/* Sort Dropdown */}
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select 
                        value={sort}
                        label="Sort by"
                        onChange={(e) => onSortChange(e.target.value)}
                    >
                        <MenuItem value="name_asc">Name ↑</MenuItem>
                        <MenuItem value="name_desc">Name ↓</MenuItem>
                        <MenuItem value="quantity_asc">Quantity ↑</MenuItem>
                        <MenuItem value="quantity_desc">Quantity ↓</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </Paper>
    );
};

export default SearchFilterBar;