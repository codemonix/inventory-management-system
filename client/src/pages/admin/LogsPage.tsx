import { ChangeEvent, ReactNode, SyntheticEvent, useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { logDebug, logError } from "../../utils/logger";

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
    Button, Stack, Box, Tabs, Tab, Chip, ChipProps, Typography,
    TablePagination,
    debounce
} from '@mui/material';
import { fetchTransactionLogs } from "../../services/transactionService";
import { fetchSystemLogs } from "../../services/systemLogService";
import LogDetailsDialog from "../../components/admin/LogDetailsDialog";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errorMessage";
import { ITransactionLog, TransactionSortField } from "../../types/transaction.types";
import { ISystemLog } from "../../types/systemLog.types";

const TX_PAGE_SIZE = 20;

interface TabPanelProps {
    children: ReactNode;
    value: number;
    index: number;
}

function CustomTabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const getLevelColor = (level: string): ChipProps['color'] => {
    switch (level) {
        case 'error': return 'error';
        case 'warn': return 'warning';
        case 'info': return 'info';
        default: return 'default';
    }
};

export default function LogsPage() {
    // System diagnostics are admin-only on the server; managers only see transactions
    const { isAdmin } = useAuth();

    // global view state
    const [searchParams, setSearchParams] = useSearchParams();

    // Active tab param
    const requestedTab = parseInt(searchParams.get('tab') ?? '', 10) || 0;
    const activeTab = isAdmin ? requestedTab : 0;

    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
        // Wipe search/page params on tab change
        setSearchParams({ tab: String(newValue) });
    };

    // Helper to update URL without losing current tab
    const updateUrl = useCallback((newParams: Record<string, string | number>) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(newParams)) next.set(key, String(value));
            return next;
        });
    }, [setSearchParams]);

    // ==========================================
    // Tab 0: Transactions (infinite scroll)
    // ==========================================
    const txSearch = searchParams.get('search') || '';
    const txSortBy = (searchParams.get('sortBy') || 'createdAt') as TransactionSortField;
    const txSortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const [txItems, setTxItems] = useState<ITransactionLog[]>([]);
    const [txTotal, setTxTotal] = useState(0);
    const [txLoading, setTxLoading] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState(txSearch);
    // Each load belongs to one filter combination; results for older ones are dropped
    const txRequestId = useRef(0);

    const loadTransactions = useCallback(async (reset: boolean, skip: number) => {
        const requestId = ++txRequestId.current;
        setTxLoading(true);
        setTxError(null);
        try {
            const response = await fetchTransactionLogs({
                search: txSearch,
                sortBy: txSortBy,
                sortOrder: txSortOrder,
                skip,
                limit: TX_PAGE_SIZE,
            });
            if (requestId !== txRequestId.current) return;
            setTxItems((prev) => (reset ? response.logs : [...prev, ...response.logs]));
            setTxTotal(response.total);
        } catch (error: unknown) {
            if (requestId !== txRequestId.current) return;
            const message = getErrorMessage(error, "Failed to load transactions.");
            logError("LogsPage -> loadTransactions failed", message);
            setTxError(message);
        } finally {
            if (requestId === txRequestId.current) setTxLoading(false);
        }
    }, [txSearch, txSortBy, txSortOrder]);

    // New filters start over from the first page
    useEffect(() => {
        if (activeTab === 0) void loadTransactions(true, 0);
    }, [activeTab, loadTransactions]);

    const txHasMore = txItems.length < txTotal;
    const loadMoreTransactions = () => {
        if (!txLoading && txHasMore) void loadTransactions(false, txItems.length);
    };
    const txSentinelRef = useInfiniteScroll<HTMLDivElement>(loadMoreTransactions, {
        enabled: activeTab === 0 && txHasMore && !txLoading && !txError,
        watch: txItems.length,
    });

    const debouncedSearch = useMemo(
        () => debounce((value: string) => updateUrl({ search: value }), 400),
        [updateUrl],
    );
    useEffect(() => () => debouncedSearch.clear(), [debouncedSearch]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleSort = (field: TransactionSortField) => {
        const nextOrder = txSortBy === field && txSortOrder === 'asc' ? 'desc' : 'asc';
        updateUrl({ sortBy: field, sortOrder: nextOrder });
    };

    const handleResetFilter = () => {
        debouncedSearch.clear();
        setSearchInput('');
        setSearchParams({ tab: '0' }); // clear search and sort
    };

    // ==========================================
    // Tab 1: System logs (standard pagination)
    // ==========================================
    const sysPage = parseInt(searchParams.get('page') ?? '', 10) || 1;
    const sysLimit = parseInt(searchParams.get('limit') ?? '', 10) || 20;

    const [sysLogs, setSysLogs] = useState<ISystemLog[]>([]);
    const [sysTotal, setSysTotal] = useState(0);
    const [sysLoading, setSysLoading] = useState(false);
    const [selectedMetadata, setSelectedMetadata] = useState<Record<string, unknown> | null>(null);

    const loadSystemLogs = useCallback(async () => {
        setSysLoading(true);
        try {
            const response = await fetchSystemLogs({
                page: sysPage,
                limit: sysLimit,
                sortBy: 'timestamp',
                sortOrder: 'desc'
            });
            logDebug("LogsPage -> loadSystemLogs response:", response);
            setSysLogs(response.logs || []);
            setSysTotal(response.totalLogs || 0);
        } catch (error: unknown) {
            logError("Failed to load system logs", getErrorMessage(error));
        } finally {
            setSysLoading(false);
        }
    }, [sysPage, sysLimit]);

    useEffect(() => {
        if (activeTab === 1) void loadSystemLogs();
    }, [activeTab, loadSystemLogs]);

    const handlePageChange = (_event: unknown, newPage: number) => {
        updateUrl({ page: newPage + 1 });
    };

    const handleLimitChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateUrl({ limit: parseInt(event.target.value, 10), page: 1 });
    };

    return (
        <Box sx={{ width: '100%', p: 1 }}>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Business Transactions" />
                    {isAdmin && <Tab label="System Diagnostics" />}
                </Tabs>
            </Box>

            {/* TAB 0: TRANSACTIONS */}
            <CustomTabPanel value={activeTab} index={0}>
                <div>
                    <Stack direction={"row"} spacing={2} alignItems={"center"} marginY={2} bgcolor={'rgba(255,255,255,0.7)'} p={1} borderRadius={1}>
                        <TextField label="Search by item, user email, location or note" fullWidth value={searchInput} onChange={handleSearchChange} />
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
                                            sx={{ whiteSpace: 'nowrap' }}
                                        >
                                            Time
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Item</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={txSortBy === 'type'}
                                            direction={txSortBy === 'type' ? txSortOrder : 'asc'}
                                            onClick={() => handleSort('type')}
                                        >
                                            Type
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={txSortBy === 'quantity'}
                                            direction={txSortBy === 'quantity' ? txSortOrder : 'asc'}
                                            onClick={() => handleSort('quantity')}
                                        >
                                            Quantity
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Note</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {txItems.map((tx) => (
                                    <TableRow key={tx._id}>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>{tx.itemId?.name ?? 'Deleted item'}</TableCell>
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

                    {/* Scrolling this into view loads the next page */}
                    <Box ref={txSentinelRef} sx={{ height: 1 }} />

                    {txLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {txError && (
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ my: 1.5 }}>
                            <Typography color="error">{txError}</Typography>
                            <Button size="small" onClick={() => loadTransactions(txItems.length === 0, txItems.length)}>Retry</Button>
                        </Stack>
                    )}
                    {!txLoading && !txError && txItems.length === 0 && (
                        <Typography color="text.secondary" align="center" sx={{ my: 3 }}>No transactions found.</Typography>
                    )}
                </div>
            </CustomTabPanel>

            {/* TAB 1: SYSTEM LOGS */}
            {isAdmin && (
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
                                        const { _id, timestamp, level, message, ...extra } = log;
                                        const hasExtra = Object.keys(extra).length > 0 && JSON.stringify(extra) !== '{"meta":{}}';

                                        return (
                                            <TableRow key={_id}>
                                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                    {new Date(timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={level.toUpperCase()}
                                                        size="small"
                                                        color={getLevelColor(level)}
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, pb: 1.5 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </CustomTabPanel>
            )}
        </Box>
    );
}
