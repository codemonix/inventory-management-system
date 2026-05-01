import { useMemo } from 'react';
import {
    Paper,
    IconButton,
    Typography,
    Skeleton,
    Tooltip,
    Box
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import InputTwoToneIcon from '@mui/icons-material/InputTwoTone';
import OutputTwoToneIcon from '@mui/icons-material/OutputTwoTone';
import SwapHorizonIcon from '@mui/icons-material/SwapHoriz';

import { useManagedImage } from "../hooks/useManagedObjectImage.js";
import { fetchItemImage } from "../services/itemService.js";
import StockDetails from "./StockDetail"; 

const defaultImage = "/uploads/items/default.jpg";

const ImageCell = ({ item }) => {
    const { displayUrl, isImageLoading } = useManagedImage(
        item.image,
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
                    <Box 
                        component="img"
                        src={displayUrl} 
                        alt={item.name} 
                        sx={{ 
                            width: 256, 
                            height: 'auto', 
                            borderRadius: 2, 
                            boxShadow: 24, 
                            border: '2px solid white',
                            backgroundColor: 'white'
                        }}
                    />
                ) : ""
            }
        >
            <Box sx={{ 
                height: '100%', 
                aspectRatio: '1/1', 
                minHeight: '60px', 
                cursor: 'pointer', 
                position: 'relative', 
                py: 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                {isImageLoading ? (
                    <Skeleton 
                        variant="rectangular" 
                        sx={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: 1 
                        }} 
                    />
                ) : (
                    <Box 
                        component="img"
                        src={displayUrl} 
                        alt={item.name} 
                        sx={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', // Ensures consistent grid rhythm
                            borderRadius: 1 
                        }} 
                    />
                )}
            </Box>
        </Tooltip>
    );
};

const DesktopInventoryTable = ({ items = [], locationColors, onIn, onOut, onAddToTransfer, locations }) => {
    
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
            renderCell: (params) => <ImageCell item={params.row} />
        },
        {
            field: 'name',
            headerName: 'Item Details',
            headerAlign: 'center',
            minWidth: 250,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', h: '100%', py: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'text.primary' }}>
                        Name: {params.row.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Code: {params.row.code}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'stock',
            headerName: 'Current Stock',
            headerAlign: 'center',
            flex: 1.5, 
            minWidth: 250,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', h: '100%', py: 2 }}>
                    <StockDetails item={params.row} locationColors={locationColors} direction="row" locations={locations} />
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center', height: '100%', px: 2}}>
                    
                        <IconButton size="medium" onClick={() => onIn(params.row)} color="primary" title="Stock In">
                            <InputTwoToneIcon fontSize="medium" />
                        </IconButton>
                        <IconButton size="medium" onClick={() => onOut(params.row)} color="error" title="Stock Out">
                            <OutputTwoToneIcon fontSize="medium" />
                        </IconButton>
                        <IconButton size="medium" onClick={() => onAddToTransfer(params.row)} color="secondary" title="Add to Transfer">
                            <SwapHorizonIcon fontSize="medium" />
                        </IconButton>
                </Box>
            )
        }
    ], [locationColors, onIn, onOut, onAddToTransfer]);

    return (
        <Paper 
            elevation={2} 
            sx={{ 
                width: '100%', 
                borderRadius: 2, 
                overflow: 'hidden', 
                bgcolor: 'background.paper',
                mb: 4 
            }}
        >
            <DataGrid
                rows={items}
                getRowId={(row) => row.itemId}
                columns={columns}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                hideFooter={true} 
                sx={{
                    border: 0,
                    '& .MuiDataGrid-virtualScroller': {
                        overflow: 'hidden !important', 
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    '& .image-no-padding': {
                        padding: 0,
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'action.hover', 
                        color: 'text.primary',          
                        fontWeight: 800,                
                        fontSize: '0.85rem',            
                        textTransform: 'uppercase',     
                        letterSpacing: '0.5px',         
                        borderBottom: '2px solid',      
                        borderColor: 'divider',
                    },
                }}
            />
        </Paper>
    );
};

export default DesktopInventoryTable;