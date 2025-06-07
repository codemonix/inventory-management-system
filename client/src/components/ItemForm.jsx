import { useState } from "react";
import { createItem } from "../services/itemsService.js";
import { logError, logInfo } from "../utils/logger.js";
import { Alert } from "@mui/material";

export default function ItemForm({ onItemCreated }) {
    const [name , setName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    logInfo("ItemForm -> name", name);

    const handleSubmit = async () => {
        // e.preventDefault();
        setErrorMessage("");
        const newItem = { name };
        logInfo("ItemForm -> newItem", newItem);
        try {
            const createdItem = await createItem(newItem);
            logInfo("ItemForm -> createdItem", createdItem);
            logInfo("ItemForm -> createdItem.message:", createdItem.message)
            onItemCreated(createdItem); // Call the callback function with the created item
            setName(""); // Clear the input field after submission
        } catch (error) {
            logError("ItemForm -> Error creating item:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            }
        }
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
        }} className="flex flex-col items-center bg-gray-300 p-4 rounded-md shadow-md mb-4">
            <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
            {errorMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {errorMessage}
                    </Alert>
            )}
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Item Name"
                className="border border-gray-400 p-2 rounded-md mb-4 w-full bg-gray-200"
                required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Create Item</button>
        </form>
    )
}