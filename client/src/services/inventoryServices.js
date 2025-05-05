import api from "../api/api.js";

export const fetchInventory = async () => {
    const res = await api.get("/inventory");
    console.log("InventoryServices -> fetchInventory:", res.data); // Log the inventory data to check if it's being retrieved correctly
    return res.data; // { items: [...] }
};

export const stockIn = async (itemId, locationId, quantity ) => {
   try {
    const res = await api.post( `/inventory/${itemId}/in`, { locationId, quantity });
    console.log("InventoryServices -> stockIn:", res.data);
    return res.data;
   } catch (error) {
    console.error("Fail to add stock:", error.message);
    throw error;
   };
}

export const stockOut = async ( itemId, locationId, quantity ) => {
    try {
        const res = await api.post(`/inventory/${itemId}/out`, { locationId, quantity });
        console.log("inventoryServices -> stockOut:", res.data);
        return res.data
    } catch (error) {
        console.error("Fail to subtract stcok:", error.message);
        throw error;
    }
};