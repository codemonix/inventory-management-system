import api from "../api/api.js";
// import axios from "axios";

export const getItems = async () => api.get("/items").then((res) => res.data); // { items: [...] }

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