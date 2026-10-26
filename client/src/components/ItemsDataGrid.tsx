import { useMemo } from 'react';
import { Paper, Tooltip, IconButton, Skeleton, Typography, Box } from '@mui/material';
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
// CUSTOM CELL: Image
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
                        maxWidth: 'none',
                        boxShadow: 'none',
                    }
                }
            }}
            title={
                !isImageLoading ? (
                    <Box 
                        component="img"
                        src={displayUrl} 
                        alt={row.name} 
                        sx={{ 
                            width: 256, 
                            height: 'auto', 
                            borderRadius: 2, // Matches the 8px global theme
                            boxShadow: 3,    // Gives it that nice pop
                            border: '2px solid',
                            borderColor: 'background.paper', // Uses theme color instead of hardcoded 'white'
                            bgcolor: 'background.paper' 
                        }}
                    />
                ) : ""
            }
        >
            <Box sx={{ height: '100%', aspectRatio: '1/1', minHeight: 60, cursor: 'pointer', position: 'relative', py: 1 }}>
                {isImageLoading ? (
                    <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 1 }} />
                ) : (
                    <Box component="img" src={displayUrl} alt={row.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, borderRadius: 1 }} />
                )}
            </Box>
        </Tooltip>
    );
};

// ==========================================
// CUSTOM CELL: Actions
// ==========================================
const GridActionCell = ({ row, onEdit, onDelete, onImageUpload, onIn, onOut, iconSize = 'small' }) => {
    const { isUploading, triggerImageUpload } = useImageUpload({
        onSuccess: onImageUpload,
        setLocalPreview: () => {} 
    });

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0, alignItems: 'center', height: '100%', p: 1 }}>
            {/* <Tooltip title="Stock In"> */}
                <IconButton size={iconSize} color="primary" onClick={() => onIn(row._id)} title='Stock In'>
                    <InputTwoToneIcon fontSize={iconSize} />
                </IconButton>
            {/* </Tooltip> */}
            {/* <Tooltip title="Stock Out"> */}
                <IconButton size={iconSize} color="error" onClick={() => onOut(row._id)} title='Stock Out'>
                    <OutputTwoTone fontSize={iconSize} />
                </IconButton>
                <IconButton size={iconSize} color="secondary" disabled={isUploading} onClick={() => triggerImageUpload(row.code, row._id, row.imageUrl)} title={isUploading ? "Uploading..." : "Upload Image"}>
                    <PhotoCameraIcon fontSize={iconSize} />
                </IconButton>
                <IconButton size={iconSize} color="primary" onClick={() => onEdit(row)} title='Edit Item'>
                    <EditIcon fontSize={iconSize} />
                </IconButton>
                <IconButton size={iconSize} color="error" onClick={() => onDelete(row)} title='Delete Item'>
                    <DeleteIcon fontSize={iconSize} />
                </IconButton>
        </Box>
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
            renderCell: (params) => <GridImageCell row={params.row} />
        },
        { 
            field: 'name', 
            headerName: 'Item Details', 
            headerAlign: 'center', 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Name: {params.row.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Code: {params.row.code || 'N/A'}
                    </Typography>
                </Box>
            )
        },
        { 
            field: 'price', 
            headerName: 'Price (€)', 
            width: 90, 
            align: 'right', 
            headerAlign: 'center', 
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
                    iconSize="medium"
                />
            )
        }
    ], [stockLookup, onEdit, onDelete, onImageUpload, onIn, onOut]);

    const gridRows = useMemo(() => items.map(item => ({ ...item, id: item._id })), [items]);

    return (
        <Paper elevation={0} sx={{ width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', mb: 2 }}>
            <DataGrid
                rows={gridRows}
                columns={columns}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                hideFooter={true} 
                sx={{
                    border: 0,
                    // Dynamic Dark Mode Colors for the Header
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'action.hover', // Subtle gray/off-white background
                        color: 'text.primary',          // Deepest black/gray text
                        fontWeight: 800,                // "Extra Bold" for maximum punch
                        fontSize: '0.85rem',            // Slightly smaller text to keep it professional
                        textTransform: 'uppercase',     // Optional: Makes it feel like a strict "Label"
                        letterSpacing: '0.5px',         // Better readability for uppercase
                        borderBottom: '2px solid',      // Thicker bottom border for a "Shelf" look
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        borderColor: 'divider',
                    },
                }}
            />
            {/* Pagination Docked at the Bottom - MUI Compliant */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                p: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'action.hover' 
            }}>
                <PaginationControls 
                    page={page} 
                    totalCount={totalCount} 
                    limit={limit} 
                    onChange={onPageChange} 
                />
            </Box>
        </Paper>
    );
};

export default ItemsDataGrid;