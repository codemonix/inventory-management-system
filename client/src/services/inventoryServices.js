import api from "../api/api.js";

export const fetchInventory = async () => {
    const res = await api.get("/inventory");
    console.log("Inventory Data:", res.data); // Log the inventory data to check if it's being retrieved correctly
    return res.data; // { items: [...] }
};