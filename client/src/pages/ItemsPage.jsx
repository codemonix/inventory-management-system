import { useState, useEffect } from 'react';
import ItemList from '../components/ItemList.jsx';
import ItemForm from '../components/ItemForm';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { getItems, deleteItem, updateItem } from '../services/itemsService.js';
import EditItemDialog from '../components/ItemEditDialog.jsx';
// import Item from '../../../server/models/item.model.js';
import { logDebug, logInfo } from '../utils/logger.js';

const ItemsPage = () => {
    const [items, setItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [triggerUpdate, setTriggerUpdate] = useState(0);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showItemForm, setShowItemForm] = useState(false);
    
    const [editButtonRef, setEditButtonRef] = useState(null);
    
    useEffect(() => {
        getItems().then(setItems).catch((error) => console.error("Error fetching items:", error.message));
    }, [triggerUpdate]);

    const toggleItemForm = () => {
        setShowItemForm((prev) => !prev);
        if (showItemForm) {
            setItemToEdit(null); // Clear the editing item
        }
    }

    const handleImageUpload = (itemId, newImageUrl) => {
        console.log("ItemsPage -> handleImageUpload -> triggerUpdate", triggerUpdate);
        setItems((prevItems) => prevItems.map(item => item._id === itemId ? { ...item, imageUrl: newImageUrl } : item));
        setTriggerUpdate(prev => prev + 1); // Trigger re-render to show updated image
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
                setItems((prevItems) => prevItems.filter((item) => item._id !== itemToDelete._id));
                setShowConfirm(false);
                setItemToDelete(null);
                setDeleteError("");
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.error("Error deleting item:", error.response.data.error);
                    setDeleteError(error.response.data.error || "Item is still in use");
                } else {
                    console.error("Error deleting item:", error.message);
                    alert("An error occurred while deleting the item. Please try again.");
                }
            }
        } else {
            console.error("No item to delete.");
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setItemToDelete(null);
        setDeleteError("");
    };

    const handleEdit = (item, buttonElement) => {
        logInfo("Item to edit:", item);
        setItemToEdit(item) ; // Set the item to be edited
        setShowEditForm(true); // Show the edit form
        setEditButtonRef(buttonElement); // Set the button reference
        
        logDebug("setItemToEdit:", itemToEdit);
    }

    const handleEditFormClose = () => {
        setItemToEdit(null); // Clear the editing item
        setShowEditForm(false); // Close the edit form
        if (editButtonRef.current) {
            logDebug("editButtonRef.current:", editButtonRef);
            editButtonRef.blur();
        }
    }

    const handleEditFormSave = async (savedItem) => {
        logInfo("Saved item:", savedItem);
        setItems((prevItems) => prevItems.map(item => item._id === savedItem._id ? savedItem : item));
        // const updatedEditItem = 
        updateItem(itemToEdit._id, savedItem)
        setShowEditForm(false); // Close the edit form
        setItemToEdit(null); // Clear the editing item
        logInfo("editButtonRef:", editButtonRef);
        if (editButtonRef.current) {
                logDebug("editButtonRef.current:", editButtonRef.current);
                editButtonRef.current.blur();
            }
        setTriggerUpdate(prev => prev + 1); // Trigger re-render to show updated item


    }

    // const handleFormSubmit = (savedItem) => {
    //     if (editingItem) {
    //         setItems((prevItems) => prevItems.map(item => item._id === savedItem._id ? savedItem : item));
    //     } else {
    //         setItems((prevItems) => [...prevItems, savedItem]);
    //     }

    // }
    logInfo("items length", items.length);
    return (
        <div>
            {showItemForm && (
                <ItemForm onItemCreated={(item) => setItems((prevItems) => [...prevItems, item.item]) } item={itemToEdit} />
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
            <ItemList items={items} onDelete={handleDelete} 
                onEdit={handleEdit} 
                onImageUpload={handleImageUpload}
                editButtonRef={editButtonRef}
            />
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