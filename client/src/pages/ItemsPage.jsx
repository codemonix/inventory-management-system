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

// MUI materials
import { Box, Container, Stack } from '@mui/material';

// Components
import StatusHandler from '../components/StatusHandler.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import ItemList from '../components/ItemList.jsx';
import CreateForm from '../components/CreateForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EditItemDialog from '../components/ItemEditDialog.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import ActionToolbar from '../components/ActionToolbar.jsx';

// Services and Utils
import { createItem, deleteItem, updateItem } from '../services/itemService.js';
import { fetchFullInventory } from '../services/inventoryService.js';
import { logDebug, logError, logInfo } from '../utils/logger.js';

const ItemsPage = () => {

    const dispatch = useDispatch()
    const [ searchParams, setSearchParams ] = useSearchParams();

    // Redux State
    const items = useSelector(selectItemsList);
    const status = useSelector(selectItemsStatus);
    const error = useSelector(selectItemsError);
    const page = useSelector(selectItemsPage);
    const limit = useSelector(selectItemsLimit);
    const totalCount = useSelector(selectItemsTotalCount);
    const sort = useSelector(selectItemsSort);
    const search = useSelector(selectItemsSearch);

    // Local State
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [showEditForm, setShowEditForm] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const refreshInventory = useCallback(async () => {
        try {
            const updatedInventory = await fetchFullInventory();
            setInventory(updatedInventory);
        } catch (error) {
            logError("ItemsPage.jsx -> refreshInventory -> Error fetching inventory:", error.message);
        }
    }, []);

    // Sync URL Params to Redux
    useEffect(() => {
        const pageParam = parseInt(searchParams.get('page')) || 1;
        const limitParam = parseInt(searchParams.get('limit')) || 10;
        const searchParam = searchParams.get('search') || '';
        const sortParam = searchParams.get('sort') || 'name_asc';

        dispatch(setPage(pageParam));
        dispatch(setLimit(limitParam))
        dispatch(setSearch(searchParam));
        dispatch(setSort(sortParam));
    }, [ searchParams, dispatch])

    // Fetch Items
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

    const handleImageUpload = (itemId, newImageUrl) => {
        const updatedItems = items.map(item => 
            item._id === itemId ? { ...item, imageUrl: newImageUrl } : item
        );
        logDebug("ItemsPage.jsx -> handleImageUpload -> updatedItems:", updatedItems);
        dispatch(updateItemImageLocal({itemId: itemId, imageUrl: newImageUrl}));
    };

    // Handlers
    const handlePageChange = ( newPage ) => { 
        const params = Object.fromEntries(searchParams.entries())
        setSearchParams({
            ...params,
            page: newPage,
            limit: limit
        });
    };

    const updateSearchParams = (newParams) => {
        setSearchParams({
            page,
            limit,
            search,
            sort,
            ...newParams
        });
    };

    const handleDelete = (item) => {
        logInfo("ItemsPage.jsx -> handleDelete ->  Item to delete:", item);
        setItemToDelete(item);
        setShowConfirm(true);
    };

    const handleToggleAdd = () => {
        if (!isAddOpen) {
            setIsSearchOpen(false);
        }
        setIsAddOpen((prev) => !prev);
        setItemToEdit(null);
    };

    const handleToggleSearch = () => {
        if (!isSearchOpen) {
            setIsAddOpen(false);
        }
        setIsSearchOpen((prev) => !prev);
    };

    const handleCloseToolbar = () => {
        setIsAddOpen(false);
        setIsSearchOpen(false);
    };
    

    const confirmDelete = async () => {
        if (itemToDelete) {
            try{
                await deleteItem(itemToDelete._id);
                const updatedItems = items.filter((item) => item._id !== itemToDelete._id);
                dispatch(loadItems({ page, limit, sort, search }))
                setShowConfirm(false);
                setItemToDelete(null);
                setDeleteError("");
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    logError("ItemsPage.jsx -> confirmDelete -> Error deleting item:", error.response.data.error);
                    setDeleteError(error.response.data.error || "Item is still in use");
                } else {
                    logError("ItemsPage.jsx -> confirmDelete -> Error deleting item:", error.message);
                    alert("An error occurred while deleting the item. Please try again.");
                }
            }
        } else {
            logInfo("No item to delete.");
        }
    };

    const handleEdit = (item) => {
        logDebug("ItemsPage.jsx -> handleEdit -> Item to edit:", item);
        setItemToEdit(item) ; 
        setShowEditForm(true); 
    }

    const handleEditFormSave = async (savedItem) => {
        logDebug("ItemsPage.jsx -> handleEditFormSave -> Saved item:", savedItem);
        try {
            await updateItem(itemToEdit._id, savedItem);
            dispatch(loadItems({ page, limit, sort, search }));
            setShowEditForm(false); 
            setItemToEdit(null); 
        } catch (error) {
            logError("ItemsPage.jsx -> handleEditFormSave -> Error updating item:", error.message);
            alert("An error occurred while updating the item. Please try again.");
        }
    }

    const handleItemCreated = () => {
        dispatch(setPage(1));
        updateSearchParams({ page: 1 });
        dispatch(loadItems({ page: 1, limit, sort, search }));
    }

    logDebug("ItemsPage.jsx -> items length:", items.length);
    logDebug("ItemsPage -> status:", status);
    return (
        <Container maxWidth="xl" sx={{ py: 1, px: 0 }}>
            <ActionToolbar 
                isAddOpen={isAddOpen}
                isSearchOpen={isSearchOpen}
                onToggleAdd={handleToggleAdd}
                onToggleSearch={handleToggleSearch}
                onCloseAll={handleCloseToolbar}
                
                searchComponent={
                    <SearchFilterBar 
                        search={search}
                        limit={limit}
                        sort={sort}
                        onSearchChange={(newSearch) => {
                            dispatch(setSearch(newSearch));
                            updateSearchParams({ search: newSearch, page: 1 });
                        }}
                        onLimitChange={(newLimit) => {
                            dispatch(setLimit(newLimit));
                            updateSearchParams({ limit: newLimit, page: 1 });
                        }}
                        onSortChange={(newSort) => {
                            dispatch(setSort(newSort));
                            updateSearchParams({ sort: newSort });
                        }}
                    />
                }
                addComponent={
                    <CreateForm 
                        title="Add New Item"
                        label="Item Name"
                        placeholder="e.g., Server Rack, Network Switch"
                        onCreate={createItem}
                        onSuccess={handleItemCreated} 
                    />
                }
            />

            {/* Main Content Area */}
            <StatusHandler status={status} error={error} loadingMessage='Loading Items ...'>
                <Stack spacing={3}>
                    <ItemList 
                        items={items} 
                        onDelete={handleDelete} 
                        onEdit={handleEdit} 
                        onImageUpload={handleImageUpload}
                        refreshInventory={refreshInventory}
                        stockLookup={stockLookup}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <PaginationControls
                            page={page}
                            totalCount={totalCount}
                            limit={limit}
                            onChange={handlePageChange}
                        />
                    </Box>
                </Stack>
            </StatusHandler>

            {/* Modals */}
            {showConfirm && (
                <ConfirmModal
                    open={showConfirm}
                    title="Delete Item"
                    message={`This item will be deleted permanently: ${itemToDelete?.name}?`}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={confirmDelete}
                    error={deleteError}
                />
            )}
            
            {showEditForm && (
                <EditItemDialog
                    open={showEditForm}
                    onClose={() => setShowEditForm(false)}
                    item={itemToEdit}
                    onSave={handleEditFormSave}
                />
            )}
        </Container>
    );
};

export default ItemsPage;