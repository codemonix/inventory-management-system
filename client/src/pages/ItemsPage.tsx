import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useSearchParams } from 'react-router-dom';

// Redux
import {
    selectItemsList, selectItemsStatus, selectItemsError, selectItemsPage, 
    selectItemsLimit, selectItemsTotalCount, selectItemsSort, selectItemsSearch
} from '../redux/selectors/itemsSelector';
import { loadItems, setPage, setLimit, setSearch, setSort, updateItemImageLocal } from '../redux/slices/itemsSlice';
import { fetchLocations } from '../redux/slices/locationsSlice';

// MUI Materials
import { Box, Container, Stack, useMediaQuery, useTheme } from '@mui/material';

// Components
import StatusHandler from '../components/StatusHandler';
import PaginationControls from '../components/PaginationControls';
import ItemList from '../components/ItemList';
import ItemsDataGrid from '../components/ItemsDataGrid';
import CreateForm from '../components/CreateForm';
import ConfirmModal from '../components/ConfirmModal';
import EditItemDialog, { ItemEditFormData } from '../components/ItemEditDialog';
import SearchFilterBar from '../components/SearchFilterBar';
import ActionToolbar from '../components/ActionToolbar';
import StockActionDialog from '../components/StockActionDialog';

// Services, Hooks, and Utils
import { createItem, deleteItem, updateItem } from '../services/itemService';
import { fetchStockTotals } from '../services/inventoryService';
import { useStockAction } from '../hooks/useStockAction';         
import { logError } from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorMessage';
import { IItem } from '../types/item.types';

const ItemsPage = () => {
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    // Catalog changes: manager or admin. Deleting: admin only (enforced by the server too)
    const { isAdmin, isManager } = useAuth();
    const canManage = isAdmin || isManager;
    
    // Responsive Breakpoints
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md')); 

    // Redux State
    const items = useAppSelector(selectItemsList);
    const status = useAppSelector(selectItemsStatus);
    const error = useAppSelector(selectItemsError);
    const page = useAppSelector(selectItemsPage);
    const limit = useAppSelector(selectItemsLimit);
    const totalCount = useAppSelector(selectItemsTotalCount);
    const sort = useAppSelector(selectItemsSort);
    const search = useAppSelector(selectItemsSearch);
    const locations = useAppSelector((state) => state.locations.locations); 

    // Local State
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<IItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<IItem | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const [showEditForm, setShowEditForm] = useState(false);
    // itemId -> total quantity over all locations, for the items on this page only
    const [stockLookup, setStockLookup] = useState<Record<string, number>>({});
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isQueryRestored, setIsQueryRestored] = useState(false);

    // ==========================================
    // DATA FETCHING & SYNC
    // ==========================================
    const pageItemIds = useMemo(() => items.map((item) => item._id).join(','), [items]);
    const refreshInventory = useCallback(async () => {
        try {
            const totals = await fetchStockTotals(pageItemIds ? pageItemIds.split(',') : []);
            setStockLookup(totals);
        } catch (error: unknown) {
            logError("ItemsPage -> Error fetching inventory:", getErrorMessage(error));
        }
    }, [pageItemIds]);

    const {
        dialogOpen: stockDialogOpen, actionType: stockActionType,
        defaultLocation: stockDefaultLocation, localError: stockError,
        openDialog: openStockDialog, closeDialog: closeStockDialog, submitAction: submitStockAction
    } = useStockAction({ onSuccess: refreshInventory });

    useEffect(() => {
        // On first load, restore list state from the URL so shared/bookmarked links work.
        // Page goes last because the other setters reset it to 1.
        const limitParam = parseInt(searchParams.get('limit') ?? '', 10);
        const searchParam = searchParams.get('search');
        const sortParam = searchParams.get('sort');
        const pageParam = parseInt(searchParams.get('page') ?? '', 10);
        if (limitParam > 0) dispatch(setLimit(limitParam));
        if (searchParam !== null) dispatch(setSearch(searchParam));
        if (sortParam) dispatch(setSort(sortParam));
        if (pageParam > 0) dispatch(setPage(pageParam));
        setIsQueryRestored(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Wait for the URL state, otherwise the default page is fetched first and then the real one
        if (!isQueryRestored) return;
        const request = dispatch(loadItems({ page, limit, sort, search }));
        // A newer query cancels the older request so a slow response cannot overwrite it
        return () => request.abort();
    }, [dispatch, isQueryRestored, page, limit, sort, search]);

    useEffect(() => {
        dispatch(fetchLocations());
    }, [dispatch]);

    // Re-fetch stock totals whenever the visible items change
    useEffect(() => {
        void refreshInventory();
    }, [refreshInventory]);

    // ==========================================
    // HANDLERS
    // ==========================================
    // Handlers passed to the grid are kept stable, so its column definitions are not rebuilt every render
    const handleImageUpload = useCallback((itemId: string, newImageUrl: string) => {
        dispatch(updateItemImageLocal({ itemId: itemId, imageUrl: newImageUrl }));
    }, [dispatch]);

    const handleStockIn = useCallback((itemId: string) => openStockDialog({ itemId }, 'IN'), [openStockDialog]);
    const handleStockOut = useCallback((itemId: string) => openStockDialog({ itemId }, 'OUT'), [openStockDialog]);

    const updateSearchParams = (newParams: Partial<Record<'page' | 'limit' | 'search' | 'sort', string | number>>) => {
        const merged = { page, limit, search, sort, ...newParams };
        setSearchParams(Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, String(v)])));
    };

    const handlePageChange = (newPage: number) => { 
        updateSearchParams({ page: newPage });
        dispatch(setPage(newPage));
    };

    const handleDelete = useCallback((item: IItem) => { setItemToDelete(item); setShowConfirm(true); }, []);
    const handleEdit = useCallback((item: IItem) => { setItemToEdit(item); setShowEditForm(true); }, []);

    const handleToggleAdd = () => {
        if (!isAddOpen) setIsSearchOpen(false);
        setIsAddOpen((prev) => !prev);
        setItemToEdit(null);
    };

    const handleToggleSearch = () => {
        if (!isSearchOpen) setIsAddOpen(false);
        setIsSearchOpen((prev) => !prev);
    };

    
    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteItem(itemToDelete._id);
                dispatch(loadItems({ page, limit, sort, search }));
                setShowConfirm(false); setItemToDelete(null); setDeleteError("");
            } catch (error: unknown) {
                // itemService rethrows with the server's message (e.g. "Item is used in Inventory")
                setDeleteError(getErrorMessage(error, "Error deleting item."));
            }
        }
    };

    const handleEditFormSave = async (savedItem: ItemEditFormData) => {
        if (!itemToEdit) return;
        // A failure is thrown on to EditItemDialog, which shows it and stays open
        await updateItem(itemToEdit._id, savedItem);
        dispatch(loadItems({ page, limit, sort, search }));
        setShowEditForm(false); setItemToEdit(null);
    };

    const handleItemCreated = () => {
        updateSearchParams({ page: 1 });
        // Changing the page already triggers the fetch effect; on page 1 reload explicitly
        if (page !== 1) dispatch(setPage(1));
        else dispatch(loadItems({ page: 1, limit, sort, search }));
    };

    return (
        <Container maxWidth="xl" sx={{ py: 1, px: 0 }}>
            <ActionToolbar 
                isAddOpen={isAddOpen} isSearchOpen={isSearchOpen}
                onToggleAdd={handleToggleAdd} onToggleSearch={handleToggleSearch}
                searchComponent={
                    <SearchFilterBar 
                        search={search} limit={limit} sort={sort}
                        onSearchChange={(s) => { dispatch(setSearch(s)); updateSearchParams({ search: s, page: 1 }); }}
                        onLimitChange={(l) => { dispatch(setLimit(l)); updateSearchParams({ limit: l, page: 1 }); }}
                        onSortChange={(s) => { dispatch(setSort(s)); updateSearchParams({ sort: s }); }}
                    />
                }
                addComponent={canManage &&
                    <CreateForm title="Add New Item" label="Item Name" placeholder="e.g., Switch" onCreate={createItem} onSuccess={handleItemCreated} />
                }
            />

            <StatusHandler status={status} error={error} loadingMessage='Loading Items ...' keepContentWhileLoading={items.length > 0}>
                
                {isDesktop ? (
                    <ItemsDataGrid 
                        items={items}
                        stockLookup={stockLookup}
                        page={page}
                        limit={limit}
                        totalCount={totalCount}
                        onPageChange={handlePageChange}
                        onEdit={canManage ? handleEdit : undefined}
                        onDelete={isAdmin ? handleDelete : undefined}
                        onImageUpload={canManage ? handleImageUpload : undefined}
                        onIn={handleStockIn}
                        onOut={handleStockOut}
                    />
                ) : (
                    <Stack spacing={2}>
                        <ItemList 
                            items={items}
                            onDelete={isAdmin ? handleDelete : undefined}
                            onEdit={canManage ? handleEdit : undefined}
                            onImageUpload={canManage ? handleImageUpload : undefined}
                            refreshInventory={refreshInventory} stockLookup={stockLookup}
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