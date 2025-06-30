import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
} from "@mui/material";
import { useState, useRef } from "react";


const SearchFilterBar = ({search, limit, sort, onSearchChange, onLimitChange, onSortChange }) => {
    const [inputValue, setInputValue] = useState(search || '');
    const debounceTimeoutRef = useRef(null);

    const handleChange = (e) => {
        e.preventDefault();
        const value = e.target.value;
        setInputValue(value);
        clearTimeout(debounceTimeoutRef.current);
        if (value.trim() === '') {
            onSearchChange(''); // Clear search if input is empty
            return;
        }
        debounceTimeoutRef.current = setTimeout(() => {
            onSearchChange(value);
        }, 2000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            clearTimeout(debounceTimeoutRef.current);
            onSearchChange(inputValue);
        }
    };

    return (
        <Paper elevation={2}
            sx={{
                display: "flex",
                gap: 2,
                padding: 1,
                marginBottom: 2,
                flexWrap: "wrap",
                alignItems: "center",
            }}>
            <TextField 
                label="Search"
                variant="outlined"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Search by name"
                sx={{ flexGrow: 1, minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 120}} >
                <InputLabel>limit</InputLabel>
                <Select 
                    value={limit}
                    label="limit"
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    >
                    {[5, 10, 20, 50].map((l) => (
                        <MenuItem key={l} value={l}>
                            {l} per page
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
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

        </Paper>
    )
};

export default SearchFilterBar;