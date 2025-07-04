import api from "../api/api.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";

export const fetchInventory = async ({ page = 1, limit = 10, sort = 'name', search = null }) => {
    logInfo("page, limit, sort, search:", page, limit, sort, search);
    try {
        const res = await api.get(`/inventory?page=${page}&limit=${limit}&sort=${sort}&search=${search}`);
        logInfo("InventoryServices -> fetchInventory:", res.data);
        return res.data; // { items: [...] }
    } catch (error) {
        logError("Fail to fetch inventory:", error.message);
        throw error;
    }
};

export const fetchFullInventory = async () => {
    try {
        const res = await api.get(`/inventory/full`);
        console.log("it is not print here")
        console.log("InventoryServices -> fetchFullInventory:", res.data);
        return res.data; // [ ...items ]
    } catch (error) {
        logError("Fail to fetch full inventory:", error.message);
        throw error;
    }
};

export const stockIn = async (itemId, locationId, quantity ) => {
   try {
    const res = await api.post( `/inventory/${itemId}/in`, { locationId, quantity });
    logInfo("InventoryServices -> stockIn:", res.data);
    return res.data;
   } catch (error) {
    logError("Fail to add stock:", error.message);
    throw error;
   };
}

export const stockOut = async ( itemId, locationId, quantity ) => {
    try {
        const res = await api.post(`/inventory/${itemId}/out`, { locationId, quantity });
        logInfo("inventoryServices -> stockOut:", res.data);
        return res.data
    } catch (error) {
        logError("Fail to subtract stcok:", error.message);
        throw error;
    }
};