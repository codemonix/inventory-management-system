import { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { TransferHistoryFilters as Filters, TransferStatus } from '../types/transfer.types';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { EMPTY_TRANSFER_FILTERS } from '../utils/transferStatus';
import { useLocations } from '../hooks/useLocations';

interface TransferHistoryFiltersProps {
    value: Filters;
    onChange: (filters: Filters) => void;
}

// Free-text search (debounced) plus status, route and date filters for the transfer history.
const TransferHistoryFilters = ({ value, onChange }: TransferHistoryFiltersProps) => {
    const { locations } = useLocations();
    const [searchText, setSearchText] = useState(value.search ?? '');
    const debouncedSearch = useDebouncedValue(searchText);

    // Push the search text up only once typing pauses
    useEffect(() => {
        if (debouncedSearch !== (value.search ?? '')) onChange({ ...value, search: debouncedSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const setField = (field: keyof Filters) => (event: ChangeEvent<HTMLInputElement>) =>
        onChange({ ...value, [field]: event.target.value });

    const hasFilters = Boolean(searchText) || (value.status && value.status !== 'all')
        || Boolean(value.fromLocation || value.toLocation || value.dateFrom || value.dateTo);

    const clearAll = () => {
        setSearchText('');
        onChange(EMPTY_TRANSFER_FILTERS);
    };

    return (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
            <TextField
                fullWidth
                size="small"
                placeholder="Search by item, location or creator email"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <Box
                sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr) auto' },
                    alignItems: 'center',
                }}
            >
                <TextField select size="small" label="Status" value={value.status ?? 'all'} onChange={setField('status')}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value={'in_transit' satisfies TransferStatus}>In transit</MenuItem>
                    <MenuItem value={'confirmed' satisfies TransferStatus}>Confirmed</MenuItem>
                    <MenuItem value={'cancelled' satisfies TransferStatus}>Cancelled</MenuItem>
                </TextField>
                <TextField select size="small" label="From" value={value.fromLocation ?? ''} onChange={setField('fromLocation')}>
                    <MenuItem value="">Any</MenuItem>
                    {locations.map((loc) => <MenuItem key={loc._id} value={loc._id}>{loc.name}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="To" value={value.toLocation ?? ''} onChange={setField('toLocation')}>
                    <MenuItem value="">Any</MenuItem>
                    {locations.map((loc) => <MenuItem key={loc._id} value={loc._id}>{loc.name}</MenuItem>)}
                </TextField>
                <TextField
                    size="small" type="date" label="From date" value={value.dateFrom ?? ''} onChange={setField('dateFrom')}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: value.dateTo || undefined } }}
                />
                <TextField
                    size="small" type="date" label="To date" value={value.dateTo ?? ''} onChange={setField('dateTo')}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: value.dateFrom || undefined } }}
                />
                <Button
                    variant="text" color="inherit" startIcon={<FilterAltOffIcon />}
                    onClick={clearAll} disabled={!hasFilters}
                    sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
                >
                    Clear
                </Button>
            </Box>
        </Stack>
    );
};

export default TransferHistoryFilters;
