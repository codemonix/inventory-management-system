import { useMemo } from 'react';
import { Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ITransfer } from '../types/transfer.types';
import { transferStatusColor, transferStatusLabel } from '../utils/transferStatus';

interface TransfersDataGridProps {
    transfers: ITransfer[];
    onViewItems: (transfer: ITransfer) => void;
    // Omitted for users who may not confirm (only managers and admins can)
    onConfirm?: (transfer: ITransfer) => void;
    // Omitted for non-admins (only admins can cancel)
    onCancel?: (transfer: ITransfer) => void;
}

// Shows every loaded row; more rows are appended by the parent's infinite scroll.
const TransfersDataGrid = ({ transfers, onViewItems, onConfirm, onCancel }: TransfersDataGridProps) => {
    const columns = useMemo<GridColDef<ITransfer>[]>(() => [
        { 
            field: 'idDisplay', headerName: 'ID', width: 90, sortable: false,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'text.secondary' }}>
                    {params.row._id.slice(-6).toUpperCase()}
                </Typography>
            )
        },
        {
            field: 'createdAt', headerName: 'Created', width: 160,
            valueGetter: (_value, row) => new Date(row.createdAt),
            renderCell: (params) => (
                <Typography variant="body2">{new Date(params.row.createdAt).toLocaleString()}</Typography>
            )
        },
        { 
            field: 'from', headerName: 'From Location', flex: 1, sortable: false,
            renderCell: (params) => <Typography variant="body2" fontWeight="medium">{params.row.fromLocation?.name || 'Unknown'}</Typography>
        },
        { 
            field: 'to', headerName: 'To Location', flex: 1, sortable: false,
            renderCell: (params) => <Typography variant="body2" fontWeight="medium" color="primary.main">{params.row.toLocation?.name || 'Unknown'}</Typography>
        },
        { 
            field: 'itemCount', headerName: 'Items', width: 80, align: 'center', headerAlign: 'center', sortable: false,
            renderCell: (params) => params.row.items?.length || 0
        },
        {
            field: 'status', headerName: 'Status', width: 120, align: 'center', headerAlign: 'center', sortable: false,
            renderCell: (params) => (
                <Chip label={transferStatusLabel(params.row.status)} color={transferStatusColor(params.row.status)} size="small" sx={{ fontWeight: 'bold' }} />
            )
        },
        {
            field: 'actions', headerName: 'Actions', width: 140, sortable: false, align: 'right', headerAlign: 'right', disableColumnMenu: true,
            renderCell: (params) => {
                const isOpen = params.row.status === 'in_transit';
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, height: '100%', alignItems: 'center' }}>
                        <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={() => onViewItems(params.row)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {onConfirm && (
                            <Tooltip title={isOpen ? "Confirm Arrival" : "Already closed"}>
                                <span>
                                    <IconButton size="small" color="success" onClick={() => onConfirm(params.row)} disabled={!isOpen} aria-label="Confirm arrival">
                                        <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {onCancel && (
                            <Tooltip title={isOpen ? "Cancel transfer (stock goes back)" : "Already closed"}>
                                <span>
                                    <IconButton size="small" color="error" onClick={() => onCancel(params.row)} disabled={!isOpen} aria-label="Cancel transfer">
                                        <CancelIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </Box>
                )
            }
        }
    ], [onViewItems, onConfirm, onCancel]);

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                autoHeight
                rows={transfers}
                getRowId={(row) => row._id}
                columns={columns}
                disableRowSelectionOnClick
                hideFooter
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
