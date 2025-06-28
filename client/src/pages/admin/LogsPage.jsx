import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogs } from "../../redux/thunks/transactionThunks";
import { resetLogs } from "../../redux/slices/transactionLogSlice";

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
    Button, Stack
} from '@mui/material'
import { useSearchParams } from "react-router-dom";
import { debounce } from "@mui/material";


export default function LogsPage() {
    const dispatch = useDispatch();
    const { items, loading, hasMore, skip } = useSelector((state) => state.transactions);
    const [ searchParams, setSearchParams ] = useSearchParams();

    const search = searchParams.get( 'search' ) || '';
    const sortBy = searchParams.get( 'sortBy' ) || 'createdAt';
    const sortOrder = searchParams.get( 'sortOrder' ) || 'desc';

    const observer = useRef();
    const lastRowRef = useCallback( node => {
        if ( loading ) return;
        if ( observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver( entries => {
            if ( entries[0].isIntersecting && hasMore ) {
                dispatch(fetchLogs({ search, sortBy, sortOrder, skip, limit: 20 }));
            }
        });
        if (node) observer.current.observer(node);
    }, [loading, hasMore, search, sortBy, sortOrder,skip, dispatch]);

    // Handle debounced search

    const debauncedSearch = useRef(
        debounce(value => {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('searsh', value);
                return newParams;
            });
        }, 400 )
    ).current;

    const handleSearchChange = e => {
        debauncedSearch(e.target.value);
    };

    const handleResetFilter = () => {
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

    return (
        <div >
            <Stack direction={"row"} spacing={2} alignItems={"center"} marginY={2} >
                <TextField label="Search logs" fullWidth defaultValue={search} onChange={handleSearchChange} />
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
                        {items.map((tx, idx) => {
                            <TableRow 
                                key={tx._id}
                                ref={idx === items.length -1 ? lastRowRef : null}
                            >
                                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                <TableCell >{tx.itemId?.name}</TableCell>
                                <TableCell >{tx.type}</TableCell>
                                <TableCell >{tx.quantity}</TableCell>
                                <TableCell >{tx.userId?.email}</TableCell>
                                <TableCell >{tx.locationId?.name}</TableCell>
                                <TableCell >{tx.note}</TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                    <CircularProgress />
                </div>
            )}
        </div>
    )
}



// const LogsPage = () => {
//     return <div> Admin - Log Monitoring</div>;
// };

// export default LogsPage;
