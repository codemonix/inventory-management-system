import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
    Box,
    Avatar,
    Typography,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useSelector, useDispatch } from "react-redux";
// import dayis from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
import {
    setSearch,
    setPage,
    setLimit,
    setSort
    // selectUsers,
} from "../../redux/slices/usersSlice.js";

import { fetchUsers, toggleUserActive } from "../../redux/thunks/userThunks.js";

import EditUserDialog from "../../components/admin/EditUserDialog.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSearchParams } from "react-router-dom";
import StatusHandler from "../../components/StatusHandler.jsx";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import { logInfo } from "../../utils/logger.js";

// dayis.extend(relativeTime);

const UserManagementPage = () => {
    const dispatch = useDispatch();
    const { 
        users, 
        page,
        limit,
        sort,
        search,
        totalCount,
        status ,
        error
         } = useSelector((state) => state.users);
    const { user: currentUser, isAdmin, isManager } = useAuth();

    const [ selectedUser, setSelectedUser ] = useState(null);
    const [ editDialogOpen, setEditDialogOpen ] = useState(false);
    const [ searchParams, setSearchParams ] = useSearchParams();

    useEffect(() => {
        const pageParam = parseInt(searchParams.get('page')) || 1 ;
        const limitParam = parseInt(searchParams.get('limit')) || 10 ;
        const searchParam = searchParams.get('search') || "";
        const sortParam = searchParams.get('sort') || 'name_asc';

        dispatch(setPage(pageParam));
        dispatch(setLimit(limitParam));
        dispatch(setSearch(searchParam));
        dispatch(setSort(sortParam));
    }, [searchParams, dispatch]);

    useEffect(() => {
        dispatch(fetchUsers({ page, limit, search, sort }));
    }, [dispatch, page, limit, search, sort ]);


    const updateSearchParams = ( newParams ) => {
        setSearchParams({
            page,
            limit,
            search,
            sort,
            ...newParams
        });
    };

    const handleSearchChange = (e) => {
        dispatch(setSearch(e.target.value));
        updateSearchParams({ search: e.target.value, page: 1 });
    };

    const handleSortChange = (e) => {
        dispatch(setSort(e.target.value));
        updateSearchParams({ sort: e.target.value, page: 1 });
    };

    const handlePageChange = ( newPage ) => {
        updateSearchParams({ page: newPage + 1 });
    };

    const handlePageSizeChange = ( newPageSize ) => {
        dispatch(setLimit(newPageSize));
        updateSearchParams( { limit: newPageSize, page: 1 });
    };



    const handleEditUserClick = (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setSelectedUser(null);
        setEditDialogOpen(false);
    }

    const handleToggleActive = (user) => {
        if ( currentUser.role === "admin" || currentUser.role === "manager") {
            dispatch(toggleUserActive({ id: user.id, isActive: !user.isActive }));
        }
    };

    const columns = [
        {
            field: "avatar",
            headerName: "",
            windth: 60,
            renderCell: (params) => (
                <Avatar
                    src={`https://api.dicebear.com/5.x/initials/svg?seed=${params.row.name}`}
                    alt={params.row.name}
                    // sx={{ width: 40, height: 40 }}
                />
            ),
            sortable: false,
            filterable: false,
        },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1.5 },
        { field: "role", headerName: "Role", width: 120 },
        {
            field: "isActive",
            headerName: "Active",
            flex: 1,
            renderCell: (params) => (
                <Switch 
                    checked={ params.row.isActive }
                    onChange={() => handleToggleActive(params.row)}
                    disabled= { !isAdmin && !isManager }
                />
            ),
        },
        {
            field: "isApproved",
            headerName: "Approved",
            width: 110,
            renderCell: (params) => (params.row.isApproved ? '✅' : '❌'),
        },
        {
            field: "lastLogin",
            headerName: "Last Login",
            flex: 1,
            renderCell: (params) => 
                params.row.lastLogin ? new Date(params.row.lastLogin).toLocaleString() : 'Never',
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditUserClick(params.row)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    logInfo("state:", useSelector((state) => state))

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>
                User Management
            </Typography>

            <SearchFilterBar 
                search={search}
                limit={limit}
                page={page}
                sort={sort}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
            />
            <StatusHandler status={status} error={error} >
                <DataGrid 
                    rows={users}
                    columns={columns}
                    pagination
                    paginationMode='server'
                    rowCount={totalCount}
                    page={ page - 1 }
                    pageSize={limit}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    getRowId={ (row) => row._id }
                    autoHeight
                />
            </StatusHandler>
            { selectedUser && 
                <EditUserDialog 
                    open={editDialogOpen}
                    onClose={handleEditClose}
                    user={selectedUser}
                />
            }
        </Box>
    );
};

export default UserManagementPage;