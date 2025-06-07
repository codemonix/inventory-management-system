import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
    selectItemsList,
    selectItemsStatus,
    selectItemsError,
    selectItemsPage,
    selectItemsLimit,
    selectItemsTotalCount
} from '../redux/selectors/itemsSelector.js'
import { loadItems, setPage, setLimit } from '../redux/slices/itemsSlice.js';
import StatusHandler from '../components/StatusHandler.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import Box from '@mui/material/Box';
import ItemList from '../components/ItemList.jsx';
import ItemForm from '../components/ItemForm';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { deleteItem, updateItem } from '../services/itemsService.js';
import EditItemDialog from '../components/ItemEditDialog.jsx';
import { logDebug, logError, logInfo } from '../utils/logger.js';

const ItemsPage = () => {

    const dispatch = useDispatch()

    const [ searchParams, setSearchParams ] = useSearchParams();

    const items = useSelector(selectItemsList);
    const status = useSelector(selectItemsStatus);
    const error = useSelector(selectItemsError);
    const page = useSelector(selectItemsPage);
    const limit = useSelector(selectItemsLimit);
    const totalCount = useSelector(selectItemsTotalCount);



    // const [items, setItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [triggerUpdate, setTriggerUpdate] = useState(0);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showItemForm, setShowItemForm] = useState(false);
    // const [openInOutDialog, setOpenInOutDialog ] = useState(false)
    // const [itemInOut, setItemInOut] = useState(null);
    // const [actionType, setActionType] = useState('IN');
    
    // useEffect(() => {
    //     getItems().then(setItems).catch((error) => console.error("Error fetching items:", error.message));
    // }, [triggerUpdate]);

    useEffect(() => {
        const pageParam = parseInt(searchParams.get('page')) || 1;
        const limitParam = parseInt(searchParams.get('limit')) || 10;

        dispatch(setPage(pageParam));
        dispatch(setLimit(limitParam))
    }, [ searchParams, dispatch])

    useEffect(() => {
        dispatch(loadItems({ page, limit }));
    }, [dispatch, page, limit, triggerUpdate]);

    useEffect(() => {
        if (!searchParams.get('page') || !searchParams.get('limit')) {
            setSearchParams({ page: 1, limit: 10})
        }
    })

    const handlePageChange = ( newPage ) => { 
        const params = Object.fromEntries(searchParams.entries())
        setSearchParams({
            ...params,
            page: newPage,
            limit: limit
        });
        // dispatch(setPage(newPage)) // loadItems will re‐fire in the useEffect because `page` changed
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
        logInfo("Item to delete:", item);
        setItemToDelete(item);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try{
                await deleteItem(itemToDelete._id);
                // setItems((prevItems) => prevItems.filter((item) => item._id !== itemToDelete._id));
                const updatedItems = items.filter( (item) => item._id !== itemToDelete._id);
                dispatch({ type: 'items/setItems', payload: updatedItems })
                setShowConfirm(false);
                setItemToDelete(null);
                setDeleteError("");
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    logError("Error deleting item:", error.response.data.error);
                    setDeleteError(error.response.data.error || "Item is still in use");
                } else {
                    logError("Error deleting item:", error.message);
                    alert("An error occurred while deleting the item. Please try again.");
                }
            }
        } else {
            logInfo("No item to delete.");
        }
        setTriggerUpdate(prev => prev + 1)
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setItemToDelete(null);
        setDeleteError("");
    };

    const handleEdit = (item) => {
        logInfo("Item to edit:", item);
        setItemToEdit(item) ; // Set the item to be edited
        setShowEditForm(true); // Show the edit form
        
        logDebug("setItemToEdit:", itemToEdit);
    }

    const handleEditFormClose = () => {
        setItemToEdit(null); // Clear the editing item
        setShowEditForm(false); // Close the edit form
        
    }

    const handleEditFormSave = async (savedItem) => {
        logInfo("Saved item:", savedItem);
        // setItems((prevItems) => prevItems.map(item => item._id === savedItem._id ? savedItem : item));
        const updatedItems = items.map( (item) => 
            item._id === savedItem._id ? savedItem : item
        );
        dispatch({ type: 'items/setItems', payload: updatedItems });
        // const updatedEditItem = 
        updateItem(itemToEdit._id, savedItem)
        setShowEditForm(false); // Close the edit form
        setItemToEdit(null); // Clear the editing item
        setTriggerUpdate(prev => prev + 1); // Trigger re-render to show updated item


    }

    // const handleInOutClick = (itemId, type ) => {
    //     setItemInOut(itemId)
    //     setActionType(type)
    //     setOpenInOutDialog(true)
    // }


    logInfo("items length", items.length);
    return (
        <div>
            {showItemForm && (
                <ItemForm onItemCreated={ () => setTriggerUpdate((prev) => prev + 1) } item={itemToEdit} />
            )}
            <div className="flex justify-center items-center pt-2">
                {/* <h3 className="text-2xl font-bold">Items</h3> */}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={toggleItemForm}
                >
                    {showItemForm ? "Close Form" : "Add Item"}
                </button>
            </div>
            <StatusHandler status={status} error={error} loadingMessage='Loading Items ...' >
                <Box >
                    <ItemList items={items} onDelete={handleDelete} 
                        onEdit={handleEdit} 
                        onImageUpload={handleImageUpload}
                    />
                    <PaginationControls
                        page={page}
                        totalCount={totalCount}
                        limit={limit}
                        onChange={handlePageChange}
                     />
                </Box>
            </StatusHandler>
            {showConfirm && (

                <ConfirmModal
                    open={showConfirm}
                    title="Delete Item"
                    message={`This item will be deleted pemanently: ${itemToDelete.name}?`}
                    onClose={() => cancelDelete()}
                    onConfirm={confirmDelete}
                    error={deleteError}
                />
            )}
            {showEditForm &&
                (<EditItemDialog
                    open={showEditForm}
                    onClose={handleEditFormClose}
                    item={itemToEdit}
                    onSave={handleEditFormSave}
                />)
            }
            
            
        </div>
    );
};

export default ItemsPage;