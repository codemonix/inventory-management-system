import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
    Box,
    Avatar,
    Typography,
    IconButton,
    Tooltip,
    Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useSelector, useDispatch } from "react-redux";
import {
    setSearch,
    setPage,
    setLimit,
    setSort
} from "../../redux/slices/usersSlice.js";

import { fetchUsers, toggleUserActive } from "../../redux/thunks/userThunks.js";

import EditUserDialog from "../../components/admin/EditUserDialog.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSearchParams } from "react-router-dom";
import StatusHandler from "../../components/StatusHandler.jsx";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import { logInfo } from "../../utils/logger.js";


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
            renderCell: (params) => (
                <Avatar
                    src={`https://api.dicebear.com/5.x/initials/svg?seed=${params.row.name}`}
                    alt={params.row.name}
                />
            ),
            sortable: false,
            filterable: false,
        },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1.5 },
        { field: "role", headerName: "Role" },
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
            flex: 1,
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
            flex: 1,
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

    logInfo("users:", users)

    return (
        <Box p={2} maxWidth="lg" mx="auto">
            <Typography variant="h5" gutterBottom>
                User Management
            </Typography>
            <Box mb={2} >
                <SearchFilterBar 
                    search={search}
                    limit={limit}
                    page={page}
                    sort={sort}
                    onSearchChange={handleSearchChange}
                    onSortChange={handleSortChange}
                />
            </Box>
            <StatusHandler status={status} error={error} >
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <DataGrid
                        sx={{ width: '100%'}}
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
                        overflow: hidden
                    />
                </Box>
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