import { useEffect, useRef, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { logDebug, logError, logInfo } from "../../utils/logger";

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
    Button, Stack, Box, Tabs, Tab, Chip,
    TablePagination,
    debounce
} from '@mui/material';
import { fetchTransactionLogs } from "../../services/transactionService";
import { fetchSystemLogs } from "../../services/systemLogService";
import LogDetailsDialog from "../../components/admin/LogDetailsDialog";



function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function LogsPage() {
    // global view state
    const [searchParams, setSearchParams] = useSearchParams();

    // Active tab param
    const activeTab = parseInt(searchParams.get('tab')) || 0;

    const handleTabChange = (event, newValue) => {
        // Wipe search/page params on tab change
        setSearchParams({ tab: newValue });
    };

    // Helper to update URL without loosing current tab
    const updateUrl = (newParams) => {
        setSearchParams((prev) => {
            const current = Object.fromEntries(prev);
            return { ...current, ...newParams};
        });
    };

    // Tab 0: Transactions (infinite scroll)
    const txSearch = searchParams.get('search') || '';
    const txSortBy = searchParams.get('sortBy') || 'createdAt';
    const txSortOrder = searchParams.get('sortOrder') || 'desc';

    // Local data state for infinite scroll
    const [txItems, setTxItems] = useState([]);
    const [txSkip, setTxSkip] = useState(0);
    const [txHasMore, setTxHasMore] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(txSearch);

    // Fetch data for infinite scroll
    const loadTransactions = useCallback(async (isRest = false, currentSkip = 0) => {
        setTxLoading(true);
        try {
            const response = await fetchTransactionLogs({
                search: txSearch,
                sortBy: txSortBy,
                sortOrder: txSortOrder,
                skip: currentSkip,
                limit: 20
            });

            const newItems = response.logs || response;

            setTxItems( prev => isRest ? newItems : [...prev, ...newItems])
            setTxHasMore(newItems.length === 20);

        } catch (error) {
            logError("Failed to load transactions", error.message)
        } finally {
            setTxLoading(false);
        }
    },[txSearch, txSortBy, txSortOrder]);

    // React to filter changes
    useEffect(() => {
        if (activeTab === 0) {
            setTxSkip(0);
            loadTransactions(true, 0) // <-- isReset = true
        }
    }, [ activeTab, loadTransactions]);

    // React to infinite scroll triggers
    useEffect(() => {
        if (activeTab === 0 && txSkip > 0) {
            loadTransactions(false, txSkip); // isReset = false, append data
        }
    }, [txSkip, activeTab, loadTransactions]);

    // The intersection ovserver (Triggers txSkip update)
    const observer = useRef();
    const lastRowRef = useCallback( node => {
        if ( txLoading ) return;
        if ( observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver( entries => {
            if ( entries[0].isIntersecting && txHasMore ) {
                setTxSkip(prev => prev + 20);
            }
        });
        if (node) observer.current.observe(node);
    }, [txLoading, txHasMore]);

    // Handlers for tab 0
    const debauncedSearch = useRef(
        debounce(value => {
            updateUrl({ search: value });
        }, 400)
    ).current;

    const handleSearchChange = e => {
        setSearchInput(e.target.value);
        debauncedSearch(e.target.value);
    };

    const handleSort = (field) => {
        const nextOrder = txSortBy === field && txSortOrder === 'asc' ? 'desc' : 'asc';
        updateUrl({ sortBy: field, sortOrder: nextOrder });
    };

    const handleResetFilter = () => {
        setSearchInput('');
        setSearchParams({ tab: 0 }); // clear search and sort
    };

   // System Logs (standard pagination)
    // URL based view state for tab1
    const sysPage = parseInt(searchParams.get('page')) || 1;
    const sysLimit = parseInt(searchParams.get('limit')) || 20;

    // Local Data state
    const [sysLogs, setSysLogs] = useState([]);
    const [sysTotal, setSysTotal] = useState(0);
    const [sysLoading, setSysLoading] = useState(false);
    const [selectedMetadata, setSelectedMetadata] = useState(null);


    // Fetch login for pagination
    const loadSystemLogs = useCallback(async () => {
        setSysLoading(true);
        try {
            const skip = (sysPage - 1) * sysLimit;
            const response = await fetchSystemLogs({
                skip,
                page: sysPage,
                limit: sysLimit,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
            logDebug("LogsPage.jsx -> loadSystemLogs response:", response);
            setSysLogs(response.logs || []);
            setSysTotal(response.totalLogs || 0);
        }catch (error) {
            logError("Failed to load system logs", error.message);
        } finally {
            setSysLoading(false);
        }
    }, [sysPage, sysLimit]);

    // React to pagination changes
    useEffect(() => {
        if (activeTab === 1) {
            loadSystemLogs();
        }
    },[activeTab, loadSystemLogs]);

    // Handlers for tab 1
    const handlePageChange = (event, newPage) => {
        updateUrl({ page: newPage + 1 });
    };

    const handleLimitChange = (event) => {
        updateUrl({ limit: parseInt(event.target.value, 10), page: 1 });
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


    // const [ tabValue, setTabValue ] = useState(0);
    // const { items, loading, hasMore, skip } = useSelector((state) => state.transactions);
    // const { logs: systemLogs, totalLogs, totalPages, loading: systemLoading} = useSelector((state) => state.system);
    // logDebug("LogsPage -> items", {items})
    // const [ searchText, setSearchText ] = useState('');

    // const search = searchParams.get( 'search' ) || '';
    // const sortBy = searchParams.get( 'sortBy' ) || 'createdAt';
    // const sortOrder = searchParams.get( 'sortOrder' ) || 'desc';

    // const [ page, setPage ] = useState(1); 
    // const [ limit, setLimit ] = useState(20);


    // useEffect(() => {
    //     if (tabValue === 1) {
    //         const skip = (page - 1) * limit;
    //         dispatch(fetchSystemLogs({ skip, page, limit, sortBy: 'createdAt', sortOrder: 'desc'}));
    //     }
    // },[tabValue, dispatch, page, limit])


    // const handlePageChange = (event, newPage) => {
    //     setPage(newPage + 1);
    // };

    // const handleLimitChange = (event) => {
    //     setLimit(parseInt(event.target.value, 10));
    //     setPage(1);
    // };
    // // Handle debounced search
    // const debauncedSearch = useRef(
    //     debounce(value => {
    //         setSearchParams(prev => {
    //             const newParams = new URLSearchParams(prev);
    //             if (value) {
    //                 newParams.set('search', value);
    //             } else {
    //                 newParams.delete('search')
    //             }
    //             return newParams;
    //         });
    //     }, 400 )
    // ).current;

    // const handleResetFilter = () => {
    //     setSearchText('');
    //     setSearchParams({});
    // };

    //Fetch if params change
    // useEffect(() => {
    //     dispatch(resetLogs());
    //     dispatch(fetchLogs({ search, page, sortBy, sortOrder, skip: 0, limit: 20 }));
    // }, [search, sortBy, sortOrder, dispatch]);

    // const handleSort = field => {
    //     const nextOreder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    //     setSearchParams(prev => {
    //         const newParams = new URLSearchParams(prev);
    //         newParams.set('sortBy', field);
    //         newParams.set('sortOrder', nextOreder);
    //         return newParams;
    //     });
    // };

    logDebug("LogsPage.jsx -> totalLogs, totalPages, loadingSystem", {sysTotal, txItems, txSkip});
    return (
        <Box sx={{ width: '100%', p: 1 }}>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Business Transactions" />
                    <Tab label="System Diagnostics" />
                </Tabs>
            </Box>

            {/* TAB 0: TRANSACTIONS */}
            <CustomTabPanel value={activeTab} index={0}>
                <div>
                    <Stack direction={"row"} spacing={2} alignItems={"center"} marginY={2} bgcolor={'rgba(255,255,255,0.7)'} p={1} borderRadius={1}>
                        <TextField label="Search logs" fullWidth value={searchInput} onChange={handleSearchChange} />
                        <Button variant="outlined" onClick={handleResetFilter}>Reset</Button>
                    </Stack>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel 
                                            active={txSortBy === 'createdAt'} 
                                            direction={txSortBy === 'createdAt' ? txSortOrder : 'asc'}
                                            onClick={() => handleSort('createdAt')}
                                            sx={{ width: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                        >
                                            Time
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Item</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Note</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {txItems.map((tx, idx) => (
                                    <TableRow 
                                        key={tx._id}
                                        ref={idx === txItems.length - 1 ? lastRowRef : null}
                                    >
                                        <TableCell sx={{ width: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>{tx.itemId?.name}</TableCell>
                                        <TableCell>{tx.type}</TableCell>
                                        <TableCell>{tx.quantity}</TableCell>
                                        <TableCell>{tx.userId?.email}</TableCell>
                                        <TableCell>{tx.locationId?.name}</TableCell>
                                        <TableCell>{tx.note}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {txLoading && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 12 }}>
                            <CircularProgress />
                        </div>
                    )}
                </div>
            </CustomTabPanel>

            {/* TAB 1: SYSTEM LOGS */}
            <CustomTabPanel value={activeTab} index={1}>
                <Paper>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Message</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="center">Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sysLogs.map((log) => {
                                    const { _id, timestamp, level, message, __v, ...extra } = log;
                                    const hasExtra = Object.keys(extra).length > 0 && JSON.stringify(extra) !== '{"meta":{}}';

                                    return (
                                        <TableRow key={log._id}>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                {new Date(timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={level.toUpperCase()} 
                                                    size="small" 
                                                    color={getLevelColor(log.level)} 
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>
                                                {message}
                                            </TableCell>
                                            <TableCell>
                                                {log.meta?.type || 'system'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {hasExtra && (
                                                    <Button 
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ minWidth: 'auto', padding: '2px 8px', fontSize: '0.75rem' }}
                                                        onClick={() => setSelectedMetadata(extra)}
                                                    >
                                                        Details
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <LogDetailsDialog 
                        open={Boolean(selectedMetadata)}
                        onClose={() => setSelectedMetadata(null)}
                        logData={selectedMetadata}
                    />
                    
                    <TablePagination
                        component="div"
                        count={sysTotal}
                        page={sysPage - 1}
                        onPageChange={handlePageChange}
                        rowsPerPage={sysLimit}
                        onRowsPerPageChange={handleLimitChange}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                    />
                </Paper>
                
                {sysLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, paddingBottom: 12 }}>
                        <CircularProgress />
                    </div>
                )}
            </CustomTabPanel>
        </Box>
    );
}