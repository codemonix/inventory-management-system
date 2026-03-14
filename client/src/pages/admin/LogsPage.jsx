import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogs } from "../../redux/thunks/transactionThunks";
import { resetLogs } from "../../redux/slices/transactionLogSlice";
import { logDebug } from "../../utils/logger";

import {
    TextField,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    Button, Stack, Box, Typography, Tabs, Tab, Chip,
    TablePagination,
} from '@mui/material'
import { useSearchParams } from "react-router-dom";
import { debounce } from "@mui/material";
import { fetchSystemLogs } from "../../redux/thunks/systemThunks";



function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function LogsPage() {
    const dispatch = useDispatch();
    const [ tabValue, setTabValue ] = useState(0);
    const { items, loading, hasMore, skip } = useSelector((state) => state.transactions);
    const { logs: systemLogs, totalLogs, totalPages, loading: systemLoading} = useSelector((state) => state.system);
    logDebug("LogsPage -> items", {items})
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ searchText, setSearchText ] = useState('');

    const search = searchParams.get( 'search' ) || '';
    const sortBy = searchParams.get( 'sortBy' ) || 'createdAt';
    const sortOrder = searchParams.get( 'sortOrder' ) || 'desc';

    const [ page, setPage ] = useState(0); 
    const [ limit, setLimit ] = useState(20);


    useEffect(() => {
        if (tabValue === 1) {
            const skip = page * limit;
            dispatch(fetchSystemLogs({ skip, page, limit, sortBy: 'createdAt', sortOrder: 'desc'}));
        }
    },[tabValue, dispatch, page, limit])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (event) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(0);
    };

    

    const getLevelColor = (level) => {
        switch (level) {
            case 'error': return 'error';
            case 'warn': return 'warning';
            case 'info': return 'info';
            case 'debug': return 'default';
            default: return 'default';
        }
    };

    const observer = useRef();
    const lastRowRef = useCallback( node => {
        if ( loading ) return;
        if ( observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver( entries => {
            if ( entries[0].isIntersecting && hasMore ) {
                dispatch(fetchLogs({ search, sortBy, sortOrder, skip, limit: 20 }));
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, search, sortBy, sortOrder,skip, dispatch]);

    // Handle debounced search
    const debauncedSearch = useRef(
        debounce(value => {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                if (value) {
                    newParams.set('search', value);
                } else {
                    newParams.delete('search')
                }
                return newParams;
            });
        }, 400 )
    ).current;

    const handleSearchChange = e => {
        const value = e.target.value;
        setSearchText(value);
        debauncedSearch(value);
    };

    const handleResetFilter = () => {
        setSearchText('');
        setSearchParams({});
    };

    //Fetch if params change
    useEffect(() => {
        dispatch(resetLogs());
        dispatch(fetchLogs({ search, sortBy, sortOrder, skip: 0, limit: 20 }));
    }, [search, sortBy, sortOrder, dispatch]);

    const handleSort = field => {
        const nextOreder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('sortBy', field);
            newParams.set('sortOrder', nextOreder);
            return newParams;
        });
    };

    logDebug("LogsPage.jsx -> totalLogs, totalPages, loadingSystem", {totalLogs, totalPages, systemLoading});
    return (
        <Box sx={{ width: '100%', p: 1 }}>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Business Transactions" />
                    <Tab label="System Diagnostics" />
                </Tabs>
            </Box>

            {/* TAB 0: Your existing transactions grid */}
            <CustomTabPanel value={tabValue} index={0}>
                <div >
                    <Stack direction={"row"} spacing={2} alignItems={"center"} marginY={2} bgcolor={'rgba(255,255,255,0.7)'} p={1} borderRadius={1}>
                        <TextField label="Search logs" fullWidth value={searchText} onChange={handleSearchChange} />
                        <Button variant="outlined" onClick={handleResetFilter}>Reset</Button>
                    </Stack>

                    <TableContainer component={Paper}>
                        <Table >
                            <TableHead >
                                <TableRow>
                                    <TableCell >
                                        <TableSortLabel active={sortBy === 'createdAt'} 
                                            direction={sortOrder}
                                            onClick={() => handleSort('creaytedAt')}
                                            sx={{ width: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                        >
                                            Time
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell >Item</TableCell>
                                    <TableCell >Type</TableCell>
                                    <TableCell >Quantity</TableCell>
                                    <TableCell >User</TableCell>
                                    <TableCell >Location</TableCell>
                                    <TableCell >Note</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody >
                                {items.map((tx, idx) => (
                                    <TableRow 
                                        key={tx._id}
                                        ref={idx === items.length -1 ? lastRowRef : null}
                                    >
                                        <TableCell
                                            sx={{ width: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                            >{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                        <TableCell >{tx.itemId?.name}</TableCell>
                                        <TableCell >{tx.type}</TableCell>
                                        <TableCell >{tx.quantity}</TableCell>
                                        <TableCell >{tx.userId?.email}</TableCell>
                                        <TableCell >{tx.locationId?.name}</TableCell>
                                        <TableCell >{tx.note}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                            <CircularProgress />
                        </div>
                    )}
                </div>
            </CustomTabPanel>

            {/* TAB 1: The new System Logs grid */}
            <CustomTabPanel value={tabValue} index={1}>
                <Paper >

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Message</TableCell>
                                    <TableCell>Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {systemLogs.map((log) => (
                                    <TableRow key={log._id}>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={log.level.toUpperCase()} 
                                                size="small" 
                                                color={getLevelColor(log.level)} 
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                            {log.message}
                                        </TableCell>
                                        <TableCell>
                                            {log.meta?.type || 'system'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={totalLogs || 0}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={limit}
                        onRowsPerPageChange={handleLimitChange}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                    />
                </Paper>
                {systemLoading && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                            <CircularProgress />
                        </div>
                    )}
            </CustomTabPanel>
                
        </Box>
        
    )
}