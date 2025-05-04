import { useState, useEffect } from 'react';
import ItemList from '../components/ItemList.jsx';
import ItemForm from '../components/ItemForm';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { getItems, deleteItem } from '../services/itemsService.js';

const ItemsPage = () => {
    const [items, setItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    
    useEffect(() => {
        getItems().then(setItems).catch((error) => console.error("Error fetching items:", error.message));
    }, []);

   

    const handleDelete = (item) => {
        console.log("Item to delete:", item);
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

    const handleEdit = (item) => {
        setEditingItem(item); // Set the item to be edited
    }

    // const handleFormSubmit = (savedItem) => {
    //     if (editingItem) {
    //         setItems((prevItems) => prevItems.map(item => item._id === savedItem._id ? savedItem : item));
    //     } else {
    //         setItems((prevItems) => [...prevItems, savedItem]);
    //     }

    // }
    console.log("ItemsPage -> items", items);
    return (
        <div>
            <ItemForm onItemCreated={(item) => setItems((prevItems) => [...prevItems, item.item]) } item={editingItem} />
            <ItemList items={items} onDelete={handleDelete} 
                onEdit={handleEdit} 
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
            
        </div>
    );
};

export default ItemsPage;