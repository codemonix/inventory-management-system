import api from "../api/api";
import { logInfo } from "../utils/logger";

export const getTransfers = async () => api.get("/transfers").then((res) => res.data); // { transfers: [...] }
export const createTransfer = async (transfer) => api.post("/transfers", transfer).then((res) => res.data); // { transfer: { id, fromLocation, toLocation, items } }
export const updateTransfer = async (id, transfer) => api.put(`/transfers/${id}`, transfer).then((res) => res.data); // { transfer: { id, fromLocation, toLocation, items } }
export const deleteTransfer = async (id) => api.delete(`/transfers/${id}`).then((res) => res.data); // { message: "Transfer deleted successfully" }
export const confirmTransfer = async (transfer) => api.put(`/transfers/${transfer._id}/confirm`).then((res) => {
    logInfo("confirmTransfer res", res)
    return res.data
}) // { message: 'Transfer received and stock updated', transfer }

// Temp Transfer
export const getTempTransfer = async () => api.get("/transfers/temp").then((res) => res.data); // { tempTransfer: { fromLocation, toLocation, items } }
export const createTempTransfer = async (tempTransfer) => api.post("/transfers/temp/init", tempTransfer).then((res) => res.data); // { tempTransfer: { fromLocation, toLocation, items } }
export const addItemToTempTransfer = async (item) => api.post("/transfers/temp/add", item).then((res) => res.data); // { tempTransfer: { fromLocation, toLocation, items } }
export const removeItemFromTempTransfer = async (itemId) => api.delete(`/transfers/temp/remove/${itemId}`).then((res) => res.data); // { tempTransfer: { fromLocation, toLocation, items } }
export const finalizeTempTransfer = async () => api.post("/transfers/temp/finalize").then((res) => res.data); // { transfer: { id, fromLocation, toLocation, items } }