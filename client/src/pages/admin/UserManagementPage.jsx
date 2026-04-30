import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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

import { getUsers, toggleUserActiveStatus } from "../../services/userService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EditUserDialog from "../../components/admin/EditUserDialog.jsx";
import StatusHandler from "../../components/StatusHandler.jsx";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import { logInfo, logError, logDebug } from "../../utils/logger.js";


const UserManagementPage = () => {
    const { user: currentUser, isAdmin, isManager } = useAuth();
    const [ searchParams, setSearchParams ] = useSearchParams();

    // DATA state
    const [ users, setUsers ] = useState([]);
    const [ totalCount, setTotalCount ] = useState(0);
    const [ status, setStatus ] = useState('idel');
    const [ error, setError ] = useState(null);

    // View state, init from URL params if any
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sort =searchParams.get('sort') || 'name_asc';
    const search = searchParams.get('search') || '';

    // Dialog state
    const [ selectedUser, setSelectedUser ] = useState(null);
    const [ editDialogOpen, setEditDialogOpen ] = useState(false);

    // Fetch data
    const loadUsersData = useCallback( async () => {
        setStatus('loading');
        setError(null);
        try {
            const response = await getUsers({ page, limit, sort, search });
            logDebug("UserManagementPage.jsx -> loadUsersData response:", response);
            setUsers(response);
            setTotalCount(response.totalCount || 0);
            setStatus('succeeded');
        } catch (error) {
            logError("UserManagementPage.jsx -> loadUsersData failed:", error.message || "Unknown Error");
            setError(error.message || "Failed to load users data.");
            setStatus('failed');
        }
    }, [page, limit, sort, search]);

    useEffect(() => {
        loadUsersData();
    }, [loadUsersData]);



    const updateSearchParams = ( newParams ) => {
        setSearchParams((prev) => {
            const current = Object.fromEntries(prev);
            return { ...current, ...newParams}
        });
    };

    const handleSearchChange = (e) => {
        updateSearchParams({ search: e.target.value, page: 1 });
    };

    const handleSortChange = (e) => {
        updateSearchParams({ sort: e.target.value, page: 1 });
    };

    const handlePageChange = ( newPage ) => {
        updateSearchParams({ page: newPage + 1 });
    };

    const handlePageSizeChange = ( newPageSize ) => {
        updateSearchParams({ limit: newPageSize, page: 1 });
    };

    const handleEditUserClick = (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setSelectedUser(null);
        setEditDialogOpen(false);
    }

    const handleToggleActive = async (userToToggle) => {
        if ( currentUser.role !== "admin" && currentUser.role !== "manager") return;
        try {
            // Backend
            const response = await toggleUserActiveStatus(userToToggle._id, !userToToggle.isActive);
            const updatedUser = response.user;
            logDebug("UserManagementPage.jsx -> handleToggleActive updatedUser:", updatedUser);
            // Local
            setUsers((prevUsers) => 
                prevUsers.map((u) => u._id === userToToggle._id ? { ...u, isActive: updatedUser.isActive } : u));
            } catch (error) {
                logError("UserManagementPage.jsx -> handleToggleActive failed:", error.message || "Unknown Error");
                setError(error.message || "Failed to toggle user active status.");
                setStatus('failed');
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

    logInfo("users currently in state:", users)

    return (
        <Box p={1} maxWidth="lg" mx="auto">
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
                        disableRowSelectionOnClick
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