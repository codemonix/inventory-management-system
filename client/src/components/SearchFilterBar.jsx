import { useState, useEffect, useRef } from "react";
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    InputAdornment,
    IconButton
} from "@mui/material";

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';


const SearchFilterBar = ({search, limit, sort, onSearchChange, onLimitChange, onSortChange }) => {
    const [inputValue, setInputValue] = useState(search || '');
    const debounceTimeoutRef = useRef(null);

    useEffect(() => {
        setInputValue(search);
    }, [search]);

    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (value.trim() === '') {
            onSearchChange(''); // Clear search if input is empty
            return;
        }
        debounceTimeoutRef.current = setTimeout(() => {
            onSearchChange(value);
        }, 500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            onSearchChange(inputValue);
        }
    };

    const handleClear = () => {
        setInputValue('');
        onSearchChange('');
    };

    return (
        <Paper elevation={2}
            className="flex gap-4 p-4 mb-6 flex-wrap items-center"
        >
            <TextField 
                label="Search"
                variant="outlined"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Search by name"
                className="grow min-w-[200px]"
                slotProps={{
                    startAdorment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdorment: inputValue ? (
                        <InputAdornment position="end">
                            <IconButton onClick={handleClear} edge="end" size="small">
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ) : null,
                }}
            />

            <FormControl className="min-w-[120]" >
                <InputLabel>limit</InputLabel>
                <Select 
                    value={limit}
                    label="Limit"
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    >
                    {[5, 10, 20, 50].map((l) => (
                        <MenuItem key={l} value={l}>
                            {l} per page
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            
            <FormControl className="min-w-[180]">
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

        </Paper>
    )
};

export default SearchFilterBar;