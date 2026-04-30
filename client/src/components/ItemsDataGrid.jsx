import { useMemo } from 'react';
import { Paper, Tooltip, IconButton, Skeleton, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoTone from '@mui/icons-material/OutputTwoTone';

// Custom Hooks & Components
import { useManagedImage } from '../hooks/useManagedObjectImage.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { fetchItemImage } from '../services/itemService.js';
import PaginationControls from './PaginationControls.jsx';

const defaultImage = "/uploads/items/default.jpg";

// ==========================================
// CUSTOM CELL: Image with Tailwind Hover
// ==========================================
const GridImageCell = ({ row }) => {
    const { displayUrl, isImageLoading } = useManagedImage(
        row.imageUrl,
        fetchItemImage,
        defaultImage
    );

    return (
        <Tooltip
            placement="right"
            slotProps={{
                tooltip: {
                    sx: {
                        backgroundColor: 'transparent',
                        padding: 0,
                        boxShadow: 'none',
                        maxWidth: 'none',
                    }
                }
            }}
            title={
                !isImageLoading ? (
                    <img 
                        src={displayUrl} 
                        alt={row.name} 
                        className="w-64 h-auto rounded-lg shadow-2xl border-2 border-white bg-white"
                    />
                ) : ""
            }
        >
            <div className="h-full aspect-square min-h-[60px] cursor-pointer relative py-1">
                {isImageLoading ? (
                    <Skeleton variant="rectangular" className="w-full h-full absolute inset-0 rounded" />
                ) : (
                    <img src={displayUrl} alt={row.name} className="w-full h-full object-cover absolute inset-0 rounded" />
                )}
            </div>
        </Tooltip>
    );
};

// ==========================================
// CUSTOM CELL: Actions
// ==========================================
const GridActionCell = ({ row, onEdit, onDelete, onImageUpload, onIn, onOut }) => {
    const { isUploading, triggerImageUpload } = useImageUpload({
        onSuccess: onImageUpload,
        setLocalPreview: () => {} 
    });

    return (
        <div className="flex justify-end gap-1 items-center h-full pr-2 py-2">
            <Tooltip title="Stock In">
                <IconButton size="small" color="primary" onClick={() => onIn(row._id)}>
                    <InputTwoToneIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Stock Out">
                <IconButton size="small" color="error" onClick={() => onOut(row._id)}>
                    <OutputTwoTone fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title={isUploading ? "Uploading..." : "Upload Image"}>
                <IconButton size="small" color="secondary" disabled={isUploading} onClick={() => triggerImageUpload(row.code, row._id, row.imageUrl)}>
                    <PhotoCameraIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit Item">
                <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete Item">
                <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </div>
    );
};

// ==========================================
// MAIN GRID COMPONENT
// ==========================================
const ItemsDataGrid = ({ 
    items, stockLookup, page, limit, totalCount, 
    onPageChange, onEdit, onDelete, onImageUpload, onIn, onOut 
}) => {
    
    const columns = useMemo(() => [
        {
            field: 'image',
            headerName: 'Image',
            width: 90,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            disableColumnMenu: true,
            className: 'image-no-padding',
            renderCell: (params) => <GridImageCell row={params.row} />
        },
        { 
            field: 'name', 
            headerName: 'Item Details', 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <div className="flex flex-col justify-center h-full py-2">
                    <Typography variant="subtitle2" className="font-semibold text-gray-800">
                        {params.row.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                        Code: {params.row.code || 'N/A'}
                    </Typography>
                </div>
            )
        },
        { 
            field: 'price', 
            headerName: 'Price (€)', 
            width: 90, 
            align: 'right', 
            headerAlign: 'right' 
        },
        {
            field: 'stock',
            headerName: 'Total Stock',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const stock = stockLookup[params.row._id] || 0;
                return (
                    <Typography 
                        variant="body2" 
                        fontWeight="bold" 
                        color={stock === 0 ? 'error.main' : 'success.main'}
                    >
                        {stock}
                    </Typography>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 220,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => (
                <GridActionCell 
                    row={params.row}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onImageUpload={onImageUpload}
                    onIn={onIn}
                    onOut={onOut}
                />
            )
        }
    ], [stockLookup, onEdit, onDelete, onImageUpload, onIn, onOut]);

    const gridRows = useMemo(() => items.map(item => ({ ...item, id: item._id })), [items]);

    return (
        <Paper className="w-full shadow-md rounded-lg overflow-hidden bg-white mb-4">
            <DataGrid
                autoHeight
                rows={gridRows}
                columns={columns}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                hideFooter={true} 
                sx={{
                    border: 0,
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f9fafb',
                        color: '#4b5563',
                        fontWeight: 'bold',
                        borderBottom: '1px solid #e5e7eb',
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                    },
                    '& .image-no-padding': {
                        padding: 0,
                    },
                }}
            />
            {/* Pagination Docked at the Bottom */}
            <div className="flex justify-center p-3 border-t border-gray-200 bg-gray-50">
                <PaginationControls 
                    page={page} 
                    totalCount={totalCount} 
                    limit={limit} 
                    onChange={onPageChange} 
                />
            </div>
        </Paper>
    );
};

export default ItemsDataGrid;
// ```</Paper>