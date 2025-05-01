import api from "../api/api.js";

export const getItems = async () => api.get("/items").then((res) => res.data); // { items: [...] }

export const createItem = async (item) => api.post("/items", item).then((res) => res.data); // { item: { id, name, description, price } }

export const updateItem = async (id, item) => api.put(`/items/${id}`, item).then((res) => res.data); // { item: { id, name, description, price } }

export const deleteItem = async (id) => api.delete(`/items/${id}`).then((res) => res.data); // { message: "Item deleted successfully" }