import {
    Paper,
    IconButton,
    Typography,
    Skeleton,
    Tooltip
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
                    <img 
                        src={displayUrl} 
                        alt={item.name} 
                        className="w-64 h-auto rounded-lg shadow-2xl border-2 border-white bg-white"
                    />
                ) : ""
            }
        >
            <div className="h-full aspect-square min-h-[60px] cursor-pointer relative py-1">
                {isImageLoading ? (
                    <Skeleton variant="rectangular" className="w-full h-full absolute inset-0 rounded" />
                ) : (
                    <img src={displayUrl} alt={item.name} className="w-full h-full object-cover absolute inset-0 rounded" />
                )}
            </div>
        </Tooltip>
    );
};

const DesktopInventoryTable = ({ items, locationColors, onIn, onOut, onAddToTransfer }) => {
    
    const columns = [
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
            minWidth: 250,
            renderCell: (params) => (
                <div className="flex flex-col justify-center h-full py-2">
                    <Typography variant="subtitle2" className="!font-semibold text-2xl text-gray-800">
                        Name: {params.row.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                        Code: {params.row.code}
                    </Typography>
                </div>
            )
        },
        {
            field: 'stock',
            headerName: 'Current Stock',
            flex: 1, 
            minWidth: 250,
            sortable: false,
            renderCell: (params) => (
                <div className="flex items-center h-full py-2">
                    <StockDetails item={params.row} locationColors={locationColors} direction="row" />
                </div>
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
                <div className="flex justify-end gap-1 items-center h-full pr-2">
                    <Tooltip title="Stock In">
                        <IconButton size="small" onClick={() => onIn(params.row)} color="primary">
                            <InputTwoToneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Stock Out">
                        <IconButton size="small" onClick={() => onOut(params.row)} color="error">
                            <OutputTwoToneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Transfer">
                        <IconButton size="small" onClick={() => onAddToTransfer(params.row)} color="secondary">
                            <SwapHorizonIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <Paper className="w-full shadow-md rounded-lg overflow-hidden bg-white mb-4">
            <DataGrid
                rows={items}
                getRowId={(row) => row.itemId}
                columns={columns}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'} gination layout issue
                hideFooter={true} 
                sx={{
                    border: 0,
                    mb: 1,
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
        </Paper>
    );
};

export default DesktopInventoryTable;