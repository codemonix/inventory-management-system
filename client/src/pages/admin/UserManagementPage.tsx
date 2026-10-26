import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {
    Box,
    Alert,
    Avatar,
    IconButton,
    Tooltip,
    Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { getUsers, toggleUserActiveStatus } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import EditUserDialog from "../../components/admin/EditUserDialog";
import StatusHandler, { LoadStatus } from "../../components/StatusHandler";
import SearchFilterBar from "../../components/SearchFilterBar";
import { logError } from "../../utils/logger";
import { getErrorMessage } from "../../utils/errorMessage";
import { IUserRecord } from "../../types/user.types";


const UserManagementPage = () => {
    const { isAdmin, isManager } = useAuth();
    const [ searchParams, setSearchParams ] = useSearchParams();

    // DATA state
    const [ users, setUsers ] = useState<IUserRecord[]>([]);
    const [ totalCount, setTotalCount ] = useState(0);
    const [ status, setStatus ] = useState<LoadStatus>('idle');
    const [ error, setError ] = useState<string | null>(null);
    // Errors from row actions are shown above the grid instead of replacing it
    const [ actionError, setActionError ] = useState<string | null>(null);

    // View state, init from URL params if any
    const page = parseInt(searchParams.get('page') ?? '', 10) || 1;
    const limit = parseInt(searchParams.get('limit') ?? '', 10) || 10;
    const sort = searchParams.get('sort') || 'name_asc';
    const search = searchParams.get('search') || '';

    // Dialog state
    const [ selectedUser, setSelectedUser ] = useState<IUserRecord | null>(null);

    // Fetch data
    const loadUsersData = useCallback( async () => {
        setStatus('loading');
        setError(null);
        try {
            const response = await getUsers({ page, limit, sort, search });
            setUsers(response.users);
            setTotalCount(response.totalCount);
            setStatus('succeeded');
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to load users data.");
            logError("UserManagementPage -> loadUsersData failed:", message);
            setError(message);
            setStatus('failed');
        }
    }, [page, limit, sort, search]);

    useEffect(() => {
        void loadUsersData();
    }, [loadUsersData]);

    const updateSearchParams = ( newParams: Record<string, string | number> ) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(newParams)) next.set(key, String(value));
            return next;
        });
    };

    const handlePaginationChange = (model: GridPaginationModel) => {
        updateSearchParams({ page: model.page + 1, limit: model.pageSize });
    };

    const handleEditClose = () => {
        setSelectedUser(null);
        // Pick up whatever the dialog changed
        void loadUsersData();
    };

    const handleToggleActive = async (userToToggle: IUserRecord) => {
        if (!isAdmin && !isManager) return;
        setActionError(null);
        try {
            const { user: updatedUser } = await toggleUserActiveStatus(userToToggle._id, !userToToggle.isActive);
            setUsers((prevUsers) =>
                prevUsers.map((u) => u._id === userToToggle._id ? { ...u, isActive: updatedUser.isActive } : u));
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to toggle user active status.");
            logError("UserManagementPage -> handleToggleActive failed:", message);
            setActionError(message);
        }
    };

    const columns: GridColDef<IUserRecord>[] = [
        {
            field: "avatar",
            headerName: "",
            renderCell: (params) => (
                <Avatar
                    src={`https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(params.row.name)}`}
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
                    <IconButton onClick={() => setSelectedUser(params.row)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <Box p={1} maxWidth="lg" mx="auto">
            <Box mb={2} >
                <SearchFilterBar
                    search={search}
                    limit={limit}
                    sort={sort}
                    onSearchChange={(value) => updateSearchParams({ search: value, page: 1 })}
                    onSortChange={(value) => updateSearchParams({ sort: value, page: 1 })}
                    onLimitChange={(value) => updateSearchParams({ limit: value, page: 1 })}
                />
            </Box>
            {actionError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>
            )}
            <StatusHandler status={status} error={error} >
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <DataGrid
                        sx={{ width: '100%'}}
                        rows={users}
                        columns={columns}
                        pagination
                        paginationMode='server'
                        rowCount={totalCount}
                        paginationModel={{ page: page - 1, pageSize: limit }}
                        onPaginationModelChange={handlePaginationChange}
                        pageSizeOptions={[10, 25, 50]}
                        getRowId={ (row) => row._id }
                        disableRowSelectionOnClick
                    />
                </Box>
            </StatusHandler>
            { selectedUser &&
                <EditUserDialog
                    open
                    onClose={handleEditClose}
                    user={selectedUser}
                />
            }
        </Box>
    );
};

export default UserManagementPage;
