import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

// Redux
import {
    selectItemsList, selectItemsStatus, selectItemsError, selectItemsPage, 
    selectItemsLimit, selectItemsTotalCount, selectItemsSort, selectItemsSearch
} from '../redux/selectors/itemsSelector.js';
import { loadItems, setPage, setLimit, setSearch, setSort, updateItemImageLocal } from '../redux/slices/itemsSlice.js';
import { fetchLocations } from '../redux/slices/locationsSlice.js';

// MUI Materials
import { Box, Container, Stack, useMediaQuery, useTheme } from '@mui/material';

// Components
import StatusHandler from '../components/StatusHandler.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import ItemList from '../components/ItemList.jsx';
import ItemsDataGrid from '../components/ItemsDataGrid.jsx'; // 👈 IMPORT YOUR NEW TABLE
import CreateForm from '../components/CreateForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EditItemDialog from '../components/ItemEditDialog.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import ActionToolbar from '../components/ActionToolbar.jsx';
import StockActionDialog from '../components/StockActionDialog.jsx';

// Services, Hooks, and Utils
import { createItem, deleteItem, updateItem } from '../services/itemService.js';
import { fetchFullInventory } from '../services/inventoryService.js';
import { useStockAction } from '../hooks/useStockAction.js';         
import { logError } from '../utils/logger.js';

const ItemsPage = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Responsive Breakpoints
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md')); 

    // Redux State
    const items = useSelector(selectItemsList);
    const status = useSelector(selectItemsStatus);
    const error = useSelector(selectItemsError);
    const page = useSelector(selectItemsPage);
    const limit = useSelector(selectItemsLimit);
    const totalCount = useSelector(selectItemsTotalCount);
    const sort = useSelector(selectItemsSort);
    const search = useSelector(selectItemsSearch);
    const locations = useSelector((state) => state.locations.locations); 

    // Local State
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [showEditForm, setShowEditForm] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // ==========================================
    // DATA FETCHING & SYNC
    // ==========================================
    const refreshInventory = useCallback(async () => {
        try {
            const updatedInventory = await fetchFullInventory();
            setInventory(updatedInventory);
        } catch (error) {
            logError("ItemsPage.jsx -> Error fetching inventory:", error.message);
        }
    }, []);

    const {
        dialogOpen: stockDialogOpen, currentItemId: stockItemId, actionType: stockActionType,
        defaultLocation: stockDefaultLocation, localError: stockError,
        openDialog: openStockDialog, closeDialog: closeStockDialog, submitAction: submitStockAction
    } = useStockAction({ onSuccess: refreshInventory });

    useEffect(() => {
        // Just reading URL params to sync state
        const pageParam = parseInt(searchParams.get('page')) || 1;
        const limitParam = parseInt(searchParams.get('limit')) || 10;
        const searchParam = searchParams.get('search') || '';
        const sortParam = searchParams.get('sort') || 'name_asc';
    }, [searchParams, dispatch]);

    useEffect(() => {
        dispatch(loadItems({ page, limit, sort, search }));
    }, [dispatch, page, limit, sort, search]);

    useEffect(() => {
        refreshInventory();
        dispatch(fetchLocations());
    }, [dispatch, refreshInventory]);

    const stockLookup = useMemo(() => {
        return inventory.reduce((acc, entry) => {
            const total = entry.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;
            const id = entry.itemId || entry._id; 
            acc[id] = total;
            return acc;
        }, {});
    }, [inventory]);

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleImageUpload = (itemId, newImageUrl) => {
        dispatch(updateItemImageLocal({ itemId: itemId, imageUrl: newImageUrl }));
    };

    const handlePageChange = (newPage) => { 
        const params = Object.fromEntries(searchParams.entries());
        setSearchParams({ ...params, page: newPage, limit: limit });
        dispatch(setPage(newPage));
    };

    const updateSearchParams = (newParams) => {
        setSearchParams({ page, limit, search, sort, ...newParams });
    };

    const handleDelete = (item) => { setItemToDelete(item); setShowConfirm(true); };
    const handleEdit = (item) => { setItemToEdit(item); setShowEditForm(true); };

    const handleToggleAdd = () => {
        if (!isAddOpen) setIsSearchOpen(false);
        setIsAddOpen((prev) => !prev);
        setItemToEdit(null);
    };

    const handleToggleSearch = () => {
        if (!isSearchOpen) setIsAddOpen(false);
        setIsSearchOpen((prev) => !prev);
    };

    const handleCloseToolbar = () => { setIsAddOpen(false); setIsSearchOpen(false); };
    
    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteItem(itemToDelete._id);
                dispatch(loadItems({ page, limit, sort, search }));
                setShowConfirm(false); setItemToDelete(null); setDeleteError("");
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    setDeleteError(error.response.data.error || "Item is still in use");
                } else {
                    alert("Error deleting item.");
                }
            }
        }
    };

    const handleEditFormSave = async (savedItem) => {
        try {
            await updateItem(itemToEdit._id, savedItem);
            dispatch(loadItems({ page, limit, sort, search }));
            setShowEditForm(false); setItemToEdit(null); 
        } catch (error) {
            alert("Error updating item.");
        }
    };

    const handleItemCreated = () => {
        dispatch(setPage(1));
        updateSearchParams({ page: 1 });
        dispatch(loadItems({ page: 1, limit, sort, search }));
    };

    return (
        <Container maxWidth="xl" sx={{ py: 1, px: 0 }}>
            <ActionToolbar 
                isAddOpen={isAddOpen} isSearchOpen={isSearchOpen}
                onToggleAdd={handleToggleAdd} onToggleSearch={handleToggleSearch} onCloseAll={handleCloseToolbar}
                searchComponent={
                    <SearchFilterBar 
                        search={search} limit={limit} sort={sort}
                        onSearchChange={(s) => { dispatch(setSearch(s)); updateSearchParams({ search: s, page: 1 }); }}
                        onLimitChange={(l) => { dispatch(setLimit(l)); updateSearchParams({ limit: l, page: 1 }); }}
                        onSortChange={(s) => { dispatch(setSort(s)); updateSearchParams({ sort: s }); }}
                    />
                }
                addComponent={
                    <CreateForm title="Add New Item" label="Item Name" placeholder="e.g., Switch" onCreate={createItem} onSuccess={handleItemCreated} />
                }
            />

            <StatusHandler status={status} error={error} loadingMessage='Loading Items ...'>
                
                {isDesktop ? (
                    // 👈 YOUR CLEAN, REUSABLE DATAGRID COMPONENT
                    <ItemsDataGrid 
                        items={items}
                        stockLookup={stockLookup}
                        page={page}
                        limit={limit}
                        totalCount={totalCount}
                        onPageChange={handlePageChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onImageUpload={handleImageUpload}
                        onIn={(id) => openStockDialog({ itemId: id }, 'IN')}
                        onOut={(id) => openStockDialog({ itemId: id }, 'OUT')}
                    />
                ) : (
                    <Stack spacing={2}>
                        <ItemList 
                            items={items} onDelete={handleDelete} onEdit={handleEdit} 
                            onImageUpload={handleImageUpload} refreshInventory={refreshInventory} stockLookup={stockLookup}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                            <PaginationControls page={page} totalCount={totalCount} limit={limit} onChange={handlePageChange} />
                        </Box>
                    </Stack>
                )}

            </StatusHandler>

            {/* Modals & Dialogs */}
            {showConfirm && (
                <ConfirmModal open={showConfirm} title="Delete Item" message={`Delete ${itemToDelete?.name}?`} onClose={() => setShowConfirm(false)} onConfirm={confirmDelete} error={deleteError} />
            )}
            
            {showEditForm && (
                <EditItemDialog open={showEditForm} onClose={() => setShowEditForm(false)} item={itemToEdit} onSave={handleEditFormSave} />
            )}

            {isDesktop && (
                <StockActionDialog
                    open={stockDialogOpen}
                    onClose={closeStockDialog}
                    onSubmit={submitStockAction}
                    itemId={stockItemId}
                    locations={locations}
                    type={stockActionType}
                    errorMessage={stockError}
                    defaultLocation={stockDefaultLocation}
                />
            )}
        </Container>
    );
};

export default ItemsPage;
// ```</Tooltip></Tooltip>