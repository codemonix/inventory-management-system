import { useMemo } from 'react';
import { Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending':
        case 'in_transit': return 'info';
        case 'confirmed': return 'success';
        default: return 'default';
    }
};

const TransfersDataGrid = ({ transfers, onViewItems, onConfirm }) => {
    const columns = useMemo(() => [
        { 
            field: 'idDisplay', headerName: 'ID', width: 90,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'text.secondary' }}>
                    {params.row._id.substring(params.row._id.length - 6).toUpperCase()}
                </Typography>
            )
        },
        { 
            field: 'from', headerName: 'From Location', flex: 1,
            renderCell: (params) => <Typography variant="body2" fontWeight="medium">{params.row.fromLocation?.name || 'Unknown'}</Typography>
        },
        { 
            field: 'to', headerName: 'To Location', flex: 1,
            renderCell: (params) => <Typography variant="body2" fontWeight="medium" color="primary.main">{params.row.toLocation?.name || 'Unknown'}</Typography>
        },
        { 
            field: 'itemCount', headerName: 'Items', width: 90, align: 'center', headerAlign: 'center',
            renderCell: (params) => params.row.items?.length || 0
        },
        {
            field: 'status', headerName: 'Status', width: 130, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Chip label={params.row.status || 'Unknown'} color={getStatusColor(params.row.status)} size="small" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }} />
            )
        },
        {
            field: 'actions', headerName: 'Actions', width: 120, sortable: false, align: 'right', headerAlign: 'right', disableColumnMenu: true,
            renderCell: (params) => {
                const isConfirmed = params.row.status === 'confirmed';
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, height: '100%', alignItems: 'center' }}>
                        <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={() => onViewItems(params.row)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={isConfirmed ? "Already Confirmed" : "Confirm Arrival"}>
                            <span>
                                <IconButton size="small" color="success" onClick={() => onConfirm(params.row)} disabled={isConfirmed}>
                                    <CheckCircleIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                )
            }
        }
    ], [onViewItems, onConfirm]);

    const gridRows = useMemo(() => transfers.map(t => ({ ...t, id: t._id })), [transfers]);

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                autoHeight
                rows={gridRows}
                columns={columns}
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                sx={{
                    border: 0,
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' },
                    '& .MuiDataGrid-cell': { borderColor: 'divider' },
                }}
            />
        </Box>
    );
};

export default TransfersDataGrid;