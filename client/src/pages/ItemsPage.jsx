import { useEffect, useState } from "react";
import { getItems, deleteItem } from "../services/itemsService.js";
import ItemForm from "../components/ItemForm.jsx";
import ItemList from "../components/ItemList.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
// import { set } from "mongoose";

export default function ItemsPage() {
    const [items, setItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        getItems().then(setItems).catch((error) => console.error("Error fetching items:", error.message));
        
    }, []);

    const handleDelete = (item) => {
        // console.log("Item to delete:", item);
        setItemToDelete(item);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await deleteItem(itemToDelete._id);
            setItems((prevItems) => prevItems.filter((item) => item._id !== itemToDelete._id));
            setShowConfirm(false);
            setItemToDelete(null);
        } else {
            console.error("No item to delete.");
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setItemToDelete(null);
    }

    return (
        <div className="bg-gray-200 p-6">
            <h2 className="text-center text-2xl font-semibold mb-4">Items</h2>
            <ItemForm onItemCreated={(newItem) => setItems((prevItems) => [...prevItems, newItem.item])} />
            <ItemList items={items} onDelete={handleDelete} />
            {showConfirm && (
                <ConfirmDeleteModal
                    title={"Delete Item"}
                    message={`This item will be deleted pemanently: ${itemToDelete.name}?`}
                    onClose={cancelDelete}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    )

}
