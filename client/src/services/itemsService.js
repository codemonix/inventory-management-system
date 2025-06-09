import api from "../api/api.js";
import { logError, logInfo } from "../utils/logger.js";
// import axios from "axios";

/*
    *

*/
export const getAllItems = async () => {
    const response = await api.get("/items/all");
    logInfo("getAllItems response:", response);
    return response.data; // { items: [{ id, name, description, price, imageUrl }] }
}

export const getPaginatedItems = async ({ page = 1, limit = 20, search = "", sort = "name_asc" }) => {
    try {
        const response = await api.get(`/items?page=${page}&limit=${limit}&search=${search}&sort=${sort}`);
        logInfo("getPaginatedItems response:", response)
        return response.data
    } catch (error) {
        if (error.response && error.response.status === 400) {
            throw new Error(error.response.data.message);
        }
        logError("Failed to fetch items:", error)
        throw Error("Failed to create item.")
    }
    
}

export const createItem = async (item) => api.post("/items", item).then((res) => res.data); // { item: { id, name, description, price } }

export const updateItem = async (id, item) => api.put(`/items/${id}`, item).then((res) => res.data); // { item: { id, name, description, price } }

export const deleteItem = async (id) => api.delete(`/items/${id}`).then((res) => res.data); // { message: "Item deleted successfully" }

export const updateImageItem = async (itemId, imageUrl) => {
    try {
        const resposne = await api.patch(`/items/${itemId}/update-image`, { imageUrl });
        return resposne.data; // { item: { id, name, description, price, imageUrl } }
    } catch (error) {
        console.error("Error updating item image:", error.message);
        throw error;
    }
};


// export async function createItem(item) {
//     try {
//         const response = await api.post("/items", item);
//         return response.data;
//     } catch (error) {
//         console.error("Error creating item:", error);
//         throw error;
//     }
// }