import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

// Redux
import {
    selectItemsList, selectItemsStatus, selectItemsError, selectItemsPage, 
    selectItemsLimit, selectItemsTotalCount, selectItemsSort, selectItemsSearch
} from '../redux/selectors/itemsSelector.js';
import { loadItems, setPage, setLimit, setSearch, setSort } from '../redux/slices/itemsSlice.js';

// MUI materials
import { Box, Container, Typography, Button, Collapse, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

// Components
import StatusHandler from '../components/StatusHandler.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import ItemList from '../components/ItemList.jsx';
// import ItemForm from '../components/ItemForm';
import CreateForm from '../components/CreateForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EditItemDialog from '../components/ItemEditDialog.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';

// Services and Utils
import { createItem, deleteItem, updateItem } from '../services/itemsService.js';
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
    const [showItemForm, setShowItemForm] = useState(false);

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

    const toggleItemForm = () => {
        setShowItemForm((prev) => !prev);
        if (showItemForm) {
            setItemToEdit(null); // Clear the editing item
        }
    }

    const handleImageUpload = (itemId, newImageUrl) => {
        const updatedItems = items.map( item => item._id === itemId ? { ...item, imageUrl: newImageUrl } : item);
        dispatch( { type: 'items/setItems', payload: updatedItems});
    };

    const handleDelete = (item) => {
        logInfo("ItemsPage.jsx -> handleDelete ->  Item to delete:", item);
        setItemToDelete(item);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try{
                await deleteItem(itemToDelete._id);
                const updatedItems = items.filter((item) => item._id !== itemToDelete._id);
                dispatch({ type: 'items/setItems', payload: updatedItems })
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

    const cancelDelete = () => {
        setShowConfirm(false);
        setItemToDelete(null);
        setDeleteError("");
    };

    const handleEdit = (item) => {
        logDebug("ItemsPage.jsx -> handleEdit -> Item to edit:", item);
        setItemToEdit(item) ; 
        setShowEditForm(true); 
    }

    const handleEditFormClose = () => {
        setItemToEdit(null); 
        setShowEditForm(false); 
        
    }

    const handleEditFormSave = async (savedItem) => {
        logDebug("ItemsPage.jsx -> handleEditFormSave -> Saved item:", savedItem);
        const updatedItems = items.map((item) => 
            item._id === savedItem._id ? savedItem : item
        );
        dispatch({ type: 'items/setItems', payload: updatedItems });
        updateItem(itemToEdit._id, savedItem)
        setShowEditForm(false); 
        setItemToEdit(null); 
    }

    const handleItemCreated = () => {
        dispatch(setPage(1));
        updateSearchParams({ page: 1 });
        dispatch(loadItems({ page: 1, limit, sort, search }));
        setShowItemForm(false);
    }

    logDebug("ItemsPage.jsx -> items length:", items.length);
    logDebug("ItemsPage -> status:", status);
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Inventory Items
                </Typography>
                
                {/* Top Right Toggle Button */}
                <Button
                    variant={showItemForm ? "outlined" : "contained"}
                    color={showItemForm ? "inherit" : "primary"}
                    startIcon={showItemForm ? <CloseIcon /> : <AddIcon />}
                    onClick={toggleItemForm}
                    disableElevation
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                    {showItemForm ? "Cancel" : "Add Item"}
                </Button>
            </Box>

            {/* Smooth Collapsible Create Form */}
            <Collapse in={showItemForm} unmountOnExit>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
                    <CreateForm 
                        title="Add New Item"
                        label="Item Name"
                        placeholder="e.g., Server Rack, Network Switch"
                        onCreate={createItem}
                        onSuccess={handleItemCreated} 
                    />
                </Box>
            </Collapse>

            {/* Main Content Area */}
            <StatusHandler status={status} error={error} loadingMessage='Loading Items ...'>
                <Stack spacing={3}>
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
                    
                    <ItemList 
                        items={items} 
                        onDelete={handleDelete} 
                        onEdit={handleEdit} 
                        onImageUpload={handleImageUpload}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
                    onClose={cancelDelete}
                    onConfirm={confirmDelete}
                    error={deleteError}
                />
            )}
            
            {showEditForm && (
                <EditItemDialog
                    open={showEditForm}
                    onClose={handleEditFormClose}
                    item={itemToEdit}
                    onSave={handleEditFormSave}
                />
            )}
        </Container>
    );
};

export default ItemsPage;